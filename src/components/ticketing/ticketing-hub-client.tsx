"use client";

import { useCallback, useEffect, useState } from "react";
import { readStore, writeStore, STORE_KEYS } from "@/lib/client-store";
import type { TicketingState } from "@/lib/ticketing-types";
import { defaultTicketingState } from "@/lib/ticketing-types";
import { GitHubMark } from "@/components/icons/github-mark";
import { Layers, Link2, Loader2, Server } from "lucide-react";
import clsx from "clsx";

type LiveStatus = { github: boolean; jira: boolean; servicenow: boolean };

export function TicketingHubClient() {
  const [state, setState] = useState<TicketingState>(() =>
    readStore(STORE_KEYS.ticketing, defaultTicketingState()),
  );
  const [live, setLive] = useState<LiveStatus | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const persist = useCallback((s: TicketingState) => {
    writeStore(STORE_KEYS.ticketing, s);
    setState(s);
  }, []);

  useEffect(() => {
    fetch("/api/integrations/status")
      .then((r) => r.json())
      .then((d: LiveStatus) => setLive(d))
      .catch(() => setLive({ github: false, jira: false, servicenow: false }));
  }, []);

  const verifyJira = async () => {
    setBusy("jira");
    setBanner(null);
    try {
      const res = await fetch("/api/integrations/jira/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectKey: state.jira.projectKey }),
      });
      const data = (await res.json()) as { error?: string; project?: string };
      if (!res.ok) throw new Error(data.error || res.statusText);
      persist({ ...state, jira: { ...state.jira, connected: true } });
      setBanner(`Jira OK — project ${data.project ?? state.jira.projectKey}`);
    } catch (e) {
      setBanner(e instanceof Error ? e.message : "Jira verify failed");
    } finally {
      setBusy(null);
    }
  };

  const verifySnow = async () => {
    setBusy("snow");
    setBanner(null);
    try {
      const res = await fetch("/api/integrations/servicenow/verify", { method: "POST" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || res.statusText);
      persist({ ...state, servicenow: { ...state.servicenow, connected: true } });
      setBanner("ServiceNow API credentials accepted.");
    } catch (e) {
      setBanner(e instanceof Error ? e.message : "ServiceNow verify failed");
    } finally {
      setBusy(null);
    }
  };

  const verifyGitHubIssues = async () => {
    setBusy("gh");
    setBanner(null);
    try {
      const res = await fetch("/api/integrations/github/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org: state.githubIssues.owner,
          repo: state.githubIssues.repo,
        }),
      });
      const data = (await res.json()) as { error?: string; fullName?: string };
      if (!res.ok) throw new Error(data.error || res.statusText);
      persist({ ...state, githubIssues: { ...state.githubIssues, connected: true } });
      setBanner(`GitHub OK — ${data.fullName ?? "repo reachable"}`);
    } catch (e) {
      setBanner(e instanceof Error ? e.message : "GitHub verify failed");
    } finally {
      setBusy(null);
    }
  };

  const card = (
    key: string,
    title: string,
    subtitle: string,
    connected: boolean,
    onDisconnect: () => void,
    onVerify: () => void,
    children: React.ReactNode,
    icon: React.ReactNode,
    serverReady: boolean,
  ) => (
    <section className="rounded-2xl border border-white/10 bg-[#0c101f]/95 p-5 shadow-lg shadow-black/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white">
            {icon}
          </div>
          <div>
            <h2 className="font-semibold text-white">{title}</h2>
            <p className="text-xs text-zinc-500">{subtitle}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={clsx(
              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset",
              connected
                ? "bg-emerald-500/15 text-emerald-200 ring-emerald-500/40"
                : "bg-zinc-600/30 text-zinc-400 ring-zinc-500/40",
            )}
          >
            {connected ? "Verified" : "Not verified"}
          </span>
          <span
            className={clsx(
              "text-[10px] font-medium uppercase tracking-wide",
              serverReady ? "text-cyan-400/90" : "text-rose-400/90",
            )}
          >
            Server {serverReady ? "configured" : "missing env"}
          </span>
        </div>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
      <div className="mt-4 flex flex-wrap gap-2">
        {!connected ? (
          <button
            type="button"
            disabled={!serverReady || busy === key}
            onClick={onVerify}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy === key ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Verify live
          </button>
        ) : (
          <button
            type="button"
            onClick={onDisconnect}
            className="rounded-lg border border-red-500/35 px-3 py-2 text-xs font-medium text-red-200 hover:bg-red-500/10"
          >
            Clear binding
          </button>
        )}
      </div>
    </section>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-2xl border border-cyan-500/20 bg-cyan-950/25 p-5">
        <div className="flex items-start gap-3">
          <Link2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-white">Live integrations</h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">
              Secrets live only in <code className="rounded bg-black/40 px-1">.env.local</code> on the
              machine running Next.js. The browser never sees tokens. Copy{" "}
              <code className="rounded bg-black/40 px-1">env.example</code> to{" "}
              <code className="rounded bg-black/40 px-1">.env.local</code> and restart the dev server.
            </p>
            {live && (
              <ul className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-500">
                <li
                  className={clsx(
                    "rounded-md px-2 py-0.5 ring-1 ring-inset",
                    live.github ? "text-emerald-200 ring-emerald-500/40" : "text-zinc-500 ring-white/10",
                  )}
                >
                  GITHUB_TOKEN: {live.github ? "set" : "missing"}
                </li>
                <li
                  className={clsx(
                    "rounded-md px-2 py-0.5 ring-1 ring-inset",
                    live.jira ? "text-emerald-200 ring-emerald-500/40" : "text-zinc-500 ring-white/10",
                  )}
                >
                  Jira env: {live.jira ? "set" : "missing"}
                </li>
                <li
                  className={clsx(
                    "rounded-md px-2 py-0.5 ring-1 ring-inset",
                    live.servicenow ? "text-emerald-200 ring-emerald-500/40" : "text-zinc-500 ring-white/10",
                  )}
                >
                  ServiceNow env: {live.servicenow ? "set" : "missing"}
                </li>
              </ul>
            )}
            {banner && (
              <p
                className={clsx(
                  "mt-3 rounded-lg border px-3 py-2 text-xs",
                  banner.includes("OK") || banner.includes("accepted")
                    ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-100"
                    : "border-rose-500/30 bg-rose-950/30 text-rose-100",
                )}
              >
                {banner}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {card(
          "jira",
          "Jira Cloud / DC",
          "Uses JIRA_HOST + JIRA_EMAIL + JIRA_API_TOKEN on the server. Project key below.",
          state.jira.connected,
          () => persist({ ...state, jira: { ...state.jira, connected: false } }),
          verifyJira,
          <>
            <p className="text-[11px] text-zinc-600">
              Site URL field is informational only — REST calls always use{" "}
              <code className="text-zinc-400">JIRA_HOST</code> from the server.
            </p>
            <label className="block text-[11px] text-zinc-500">
              Site URL (docs)
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 font-mono text-sm text-white"
                value={state.jira.siteUrl}
                onChange={(e) =>
                  persist({ ...state, jira: { ...state.jira, siteUrl: e.target.value } })
                }
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-[11px] text-zinc-500">
                Project key
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 font-mono text-sm text-white"
                  value={state.jira.projectKey}
                  onChange={(e) =>
                    persist({ ...state, jira: { ...state.jira, projectKey: e.target.value } })
                  }
                />
              </label>
              <label className="block text-[11px] text-zinc-500">
                Issue type name
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-sm text-white"
                  value={state.jira.issueType}
                  onChange={(e) =>
                    persist({ ...state, jira: { ...state.jira, issueType: e.target.value } })
                  }
                />
              </label>
            </div>
          </>,
          <Layers className="h-5 w-5 text-[#2684FF]" />,
          Boolean(live?.jira),
        )}

        {card(
          "snow",
          "ServiceNow",
          "Table API on SERVICENOW_INSTANCE with bearer token or basic auth.",
          state.servicenow.connected,
          () => persist({ ...state, servicenow: { ...state.servicenow, connected: false } }),
          verifySnow,
          <>
            <label className="block text-[11px] text-zinc-500">
              Instance host (for your notes; API uses SERVICENOW_INSTANCE on server)
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 font-mono text-sm text-white"
                value={state.servicenow.instanceHost}
                onChange={(e) =>
                  persist({
                    ...state,
                    servicenow: { ...state.servicenow, instanceHost: e.target.value },
                  })
                }
              />
            </label>
            <label className="block text-[11px] text-zinc-500">
              Target table (POST body uses short_description + description; extend API for custom tables)
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 font-mono text-sm text-white"
                value={state.servicenow.table}
                onChange={(e) =>
                  persist({ ...state, servicenow: { ...state.servicenow, table: e.target.value } })
                }
              />
            </label>
          </>,
          <Server className="h-5 w-5 text-green-400" />,
          Boolean(live?.servicenow),
        )}

        {card(
          "gh",
          "GitHub Issues",
          "Same GITHUB_TOKEN as workflow dispatch; needs issues write on the backlog repo.",
          state.githubIssues.connected,
          () => persist({ ...state, githubIssues: { ...state.githubIssues, connected: false } }),
          verifyGitHubIssues,
          <>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-[11px] text-zinc-500">
                Owner
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 font-mono text-sm text-white"
                  value={state.githubIssues.owner}
                  onChange={(e) =>
                    persist({
                      ...state,
                      githubIssues: { ...state.githubIssues, owner: e.target.value },
                    })
                  }
                />
              </label>
              <label className="block text-[11px] text-zinc-500">
                Repo
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 font-mono text-sm text-white"
                  value={state.githubIssues.repo}
                  onChange={(e) =>
                    persist({
                      ...state,
                      githubIssues: { ...state.githubIssues, repo: e.target.value },
                    })
                  }
                />
              </label>
            </div>
            <label className="block text-[11px] text-zinc-500">
              Label (applied when creating issues from Findings)
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 font-mono text-sm text-white"
                value={state.githubIssues.label}
                onChange={(e) =>
                  persist({
                    ...state,
                    githubIssues: { ...state.githubIssues, label: e.target.value },
                  })
                }
              />
            </label>
          </>,
          <GitHubMark className="h-5 w-5" />,
          Boolean(live?.github),
        )}
      </div>
    </div>
  );
}
