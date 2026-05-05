"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EngineDomain } from "@/lib/scan-domain-config";
import { DOMAIN_CONFIG } from "@/lib/scan-domain-config";
import { readStore, writeStore, STORE_KEYS } from "@/lib/client-store";
import type { GitHubEnginesState } from "@/lib/github-engine-types";
import { defaultGitHubBinding } from "@/lib/github-engine-types";
import { GitHubMark } from "@/components/icons/github-mark";
import { NexusIngestPanel } from "@/components/engines/nexus-ingest-panel";
import { Loader2, Play, Shield, Zap } from "lucide-react";
import clsx from "clsx";

export function DomainHubClient({ domain }: { domain: EngineDomain }) {
  const cfg = DOMAIN_CONFIG[domain];
  const [gh, setGh] = useState<GitHubEnginesState>(() =>
    readStore<GitHubEnginesState>(STORE_KEYS.engineGitHub, {}),
  );
  const binding = useMemo(() => ({ ...defaultGitHubBinding(), ...gh[domain] }), [gh, domain]);
  const [log, setLog] = useState<string[]>([]);
  const [serverToken, setServerToken] = useState<boolean | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/integrations/status")
      .then((r) => r.json())
      .then((d: { github?: boolean }) => setServerToken(Boolean(d.github)))
      .catch(() => setServerToken(false));
  }, []);

  const persist = useCallback(
    (next: GitHubEnginesState) => {
      writeStore(STORE_KEYS.engineGitHub, next);
      setGh(next);
    },
    [],
  );

  const updateBinding = (patch: Partial<typeof binding>) => {
    const merged = { ...binding, ...patch };
    persist({ ...gh, [domain]: merged });
  };

  const connect = async () => {
    setPanelError(null);
    setBusy("connect");
    try {
      const res = await fetch("/api/integrations/github/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org: binding.org, repo: binding.repo }),
      });
      const data = (await res.json()) as { error?: string; fullName?: string };
      if (!res.ok) throw new Error(data.error || res.statusText);
      updateBinding({
        connected: true,
        connectedAt: new Date().toISOString(),
        workflowFile: binding.workflowFile || cfg.defaultWorkflow,
      });
      setLog((l) => [
        `[${new Date().toLocaleTimeString()}] Verified repo ${data.fullName ?? `${binding.org}/${binding.repo}`} via GITHUB_TOKEN.`,
        ...l,
      ]);
    } catch (e) {
      setPanelError(e instanceof Error ? e.message : "GitHub verify failed");
    } finally {
      setBusy(null);
    }
  };

  const disconnect = () => {
    updateBinding({ connected: false, connectedAt: undefined });
    setPanelError(null);
  };

  const dispatchScan = async (trigger: "push" | "pr" | "manual") => {
    setPanelError(null);
    setBusy(`dispatch-${trigger}`);
    try {
      const res = await fetch("/api/integrations/github/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org: binding.org,
          repo: binding.repo,
          workflowFile: binding.workflowFile,
          inputs: { aspm_trigger: trigger },
        }),
      });
      const data = (await res.json()) as { error?: string; workflowPath?: string; ref?: string };
      if (!res.ok) throw new Error(data.error || res.statusText);
      const wf = `https://github.com/${binding.org}/${binding.repo}/actions/workflows/${binding.workflowFile}`;
      setLog((l) => [
        `[${new Date().toLocaleTimeString()}] workflow_dispatch (${trigger}) OK → ${data.workflowPath ?? binding.workflowFile} @ ${data.ref ?? "main"}`,
        `[${new Date().toLocaleTimeString()}] ${wf}`,
        ...l,
      ]);
    } catch (e) {
      setPanelError(e instanceof Error ? e.message : "Dispatch failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section
        className={clsx(
          "relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-6 ring-1 ring-white/5",
          cfg.accent,
        )}
      >
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
              <Shield className="h-3.5 w-3.5 text-white/80" />
              Engine room
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{cfg.label}</h2>
            <p className="mt-1 text-sm text-zinc-300">{cfg.short}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {cfg.scanners.map((s) => (
              <span
                key={s.name}
                className="rounded-lg border border-white/15 bg-black/30 px-2.5 py-1 text-xs text-zinc-200"
              >
                {s.name}
                <span className="ml-1.5 font-mono text-[10px] text-zinc-500">{s.ingest}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-rose-500/25 bg-rose-950/20 p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-100">
          <Zap className="h-4 w-4 text-rose-300" />
          Field realities (fix these first)
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-rose-50/90 marker:text-rose-400">
          {cfg.brutalRealities.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0c101f]/90 p-5 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <GitHubMark className="h-4 w-4" />
            GitHub — runs &amp; posture back to Nexus
          </h3>
          {binding.connected ? (
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200 ring-1 ring-emerald-500/40">
              Connected
            </span>
          ) : (
            <span className="rounded-full bg-zinc-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 ring-1 ring-zinc-600/50">
              Not connected
            </span>
          )}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          <strong className="text-zinc-300">Live mode:</strong> set{" "}
          <code className="rounded bg-black/40 px-1">GITHUB_TOKEN</code> in{" "}
          <code className="rounded bg-black/40 px-1">.env.local</code> with repo + workflow scopes.
          Verify calls GitHub REST; dispatch calls{" "}
          <code className="rounded bg-black/40 px-1">workflow_dispatch</code>. Nexus orchestrates workflows in{" "}
          <em>your</em> repo so scan output and checks can be reported <strong className="text-zinc-400">into</strong>{" "}
          Nexus ASPM — not as a bridge between external scanners and GitHub.
        </p>
        {serverToken === false && (
          <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-950/30 px-2 py-1.5 text-[11px] text-amber-100">
            Server reports GITHUB_TOKEN missing — actions will fail until configured.
          </p>
        )}
        {panelError && (
          <p className="mt-2 rounded-lg border border-rose-500/30 bg-rose-950/30 px-2 py-1.5 text-[11px] text-rose-100">
            {panelError}
          </p>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-[11px] text-zinc-500">
            Organization
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 font-mono text-sm text-white"
              value={binding.org}
              onChange={(e) => updateBinding({ org: e.target.value })}
            />
          </label>
          <label className="text-[11px] text-zinc-500">
            Repository
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 font-mono text-sm text-white"
              value={binding.repo}
              onChange={(e) => updateBinding({ repo: e.target.value })}
            />
          </label>
          <label className="text-[11px] text-zinc-500 sm:col-span-2">
            Workflow file
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 font-mono text-sm text-white"
              value={binding.workflowFile}
              onChange={(e) => updateBinding({ workflowFile: e.target.value })}
            />
          </label>
        </div>

        <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-black/25 p-3">
          {(
            [
              ["scanOnPush", "Scan on every push (default + release branches)"],
              ["scanOnPullRequest", "Scan on pull request (diff-aware where supported)"],
              ["requiredCheckOnPr", "Block merge if this engine fails (required check)"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center gap-3 text-sm text-zinc-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/20 bg-black/50 text-cyan-500 focus:ring-cyan-500/40"
                checked={binding[key]}
                onChange={(e) => updateBinding({ [key]: e.target.checked })}
              />
              {label}
            </label>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {!binding.connected ? (
            <button
              type="button"
              disabled={busy === "connect" || serverToken === false}
              onClick={() => void connect()}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy === "connect" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitHubMark className="h-4 w-4" />}
              Verify &amp; bind repo
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => void dispatchScan("manual")}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/90 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-lg shadow-cyan-500/25 hover:bg-cyan-400 disabled:opacity-50"
              >
                {busy === "dispatch-manual" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Dispatch workflow
              </button>
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => void dispatchScan("push")}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-white/10 disabled:opacity-50"
              >
                Dispatch (aspm_trigger=push)
              </button>
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => void dispatchScan("pr")}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-white/10 disabled:opacity-50"
              >
                Dispatch (aspm_trigger=pr)
              </button>
              <button
                type="button"
                onClick={disconnect}
                className="ml-auto rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-200 hover:bg-red-500/10"
              >
                Unbind
              </button>
            </>
          )}
        </div>
      </section>

      <NexusIngestPanel domain={domain} />

      {log.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Activity</h3>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto font-mono text-[11px] text-zinc-400">
            {log.map((line, i) => (
              <li key={`${i}-${line.slice(0, 24)}`}>{line}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
