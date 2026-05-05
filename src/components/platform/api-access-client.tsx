"use client";

import { useCallback, useMemo, useState } from "react";
import {
  API_KEY_SCOPES,
  type ApiKeyScope,
  type NexusApiKey,
  generateApiKeySecret,
} from "@/lib/api-keys-types";
import { readStore, writeStore, STORE_KEYS } from "@/lib/client-store";
import { BookOpen, Check, Copy, Key, Plus, Trash2, Webhook } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

type ApiEndpoint = {
  method: string;
  path: string;
  body?: string;
  note: string;
};

const ENDPOINTS: ApiEndpoint[] = [
  {
    method: "POST",
    path: "/api/ingest/sarif",
    body: "SARIF 2.1.0 JSON",
    note: "Primary signal path from CI into Nexus (stub persistence in this build).",
  },
  {
    method: "GET",
    path: "/api/integrations/status",
    note: "Returns which server-side integration env vars are present (never values).",
  },
  {
    method: "POST",
    path: "/api/integrations/github/verify",
    body: "{ org, repo }",
    note: "Validates PAT can read repository metadata.",
  },
  {
    method: "POST",
    path: "/api/integrations/github/dispatch",
    body: "{ org, repo, workflowFile, inputs }",
    note: "Triggers workflow_dispatch in the bound repo.",
  },
  {
    method: "POST",
    path: "/api/findings/intel",
    body: "{ findingId, title, description, ... }",
    note: "OSV / NVD enrichment + optional AI remediation (requires keys in .env.local).",
  },
];

export function ApiAccessClient() {
  const [keys, setKeys] = useState<NexusApiKey[]>(() => readStore(STORE_KEYS.nexusApiKeys, []));
  const [label, setLabel] = useState("");
  const [scopes, setScopes] = useState<ApiKeyScope[]>(["ingest:sarif", "findings:read"]);
  const [revealOnce, setRevealOnce] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [openDoc, setOpenDoc] = useState<string | null>("ingest");

  const persist = useCallback((next: NexusApiKey[]) => {
    writeStore(STORE_KEYS.nexusApiKeys, next);
    setKeys(next);
  }, []);

  const toggleScope = (s: ApiKeyScope) => {
    setScopes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const createKey = () => {
    const secret = generateApiKeySecret();
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
    const row: NexusApiKey = {
      id,
      label: label.trim() || "Unlabeled key",
      prefix: `${secret.slice(0, 16)}…`,
      scopes: scopes.length ? scopes : ["findings:read"],
      createdAt: new Date().toISOString(),
    };
    persist([row, ...keys]);
    setRevealOnce(secret);
    setCopied(false);
    setLabel("");
  };

  const revoke = (id: string) => {
    persist(
      keys.map((k) => (k.id === id ? { ...k, revokedAt: new Date().toISOString() } : k)),
    );
  };

  const active = useMemo(() => keys.filter((k) => !k.revokedAt), [keys]);

  const copySecret = async () => {
    if (!revealOnce) return;
    await navigator.clipboard.writeText(revealOnce);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-cyan-500/25 bg-cyan-950/20 p-6 ring-1 ring-cyan-500/15">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Key className="h-4 w-4 text-cyan-300" />
            Create Nexus API key
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-zinc-400">
            Simulated in-browser for this demo — production Nexus should mint keys server-side with HSM-backed
            material and immutable audit events.
          </p>

          <label className="mt-4 block text-[11px] text-zinc-500">
            Label
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. ci-prod-east-sarif"
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>

          <div className="mt-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Scopes</p>
            <div className="mt-2 flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
              {API_KEY_SCOPES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleScope(s)}
                  className={clsx(
                    "rounded-lg border px-2 py-1 font-mono text-[10px] transition",
                    scopes.includes(s)
                      ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-100"
                      : "border-white/10 bg-black/30 text-zinc-500 hover:border-white/20",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={createKey}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-400"
          >
            <Plus className="h-4 w-4" />
            Generate key
          </button>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0c101f]/90 p-6 ring-1 ring-white/[0.04]">
          <h2 className="text-sm font-semibold text-white">Active keys</h2>
          <p className="mt-1 text-xs text-zinc-500">{active.length} active · {keys.length - active.length} revoked</p>
          <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
            {keys.length === 0 ? (
              <li className="rounded-lg border border-dashed border-white/15 px-3 py-6 text-center text-sm text-zinc-500">
                No keys yet — create one to see prefix storage and scope chips.
              </li>
            ) : (
              keys.map((k) => (
                <li
                  key={k.id}
                  className={clsx(
                    "flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2",
                    k.revokedAt ? "border-white/5 bg-black/20 opacity-50" : "border-white/10 bg-black/35",
                  )}
                >
                  <div>
                    <p className="text-sm font-medium text-white">{k.label}</p>
                    <p className="font-mono text-[11px] text-zinc-500">{k.prefix}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {k.scopes.slice(0, 4).map((s) => (
                        <span key={s} className="rounded bg-white/5 px-1 py-0.5 font-mono text-[9px] text-zinc-400">
                          {s}
                        </span>
                      ))}
                      {k.scopes.length > 4 && (
                        <span className="text-[9px] text-zinc-600">+{k.scopes.length - 4}</span>
                      )}
                    </div>
                  </div>
                  {!k.revokedAt ? (
                    <button
                      type="button"
                      onClick={() => revoke(k.id)}
                      className="inline-flex items-center gap-1 rounded border border-rose-500/40 px-2 py-1 text-[11px] text-rose-200 hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                      Revoke
                    </button>
                  ) : (
                    <span className="text-[10px] text-zinc-600">revoked</span>
                  )}
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      {revealOnce && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-950/30 p-5 ring-1 ring-amber-500/20">
          <p className="text-sm font-semibold text-amber-100">Copy this secret now</p>
          <p className="mt-1 text-xs text-amber-200/80">
            It will not be shown again. This build never sends it to a server — only you decide where to paste it.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="max-w-full overflow-x-auto rounded-lg bg-black/50 px-3 py-2 font-mono text-xs text-emerald-200">
              {revealOnce}
            </code>
            <button
              type="button"
              onClick={() => void copySecret()}
              className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white hover:bg-white/15"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={() => setRevealOnce(null)}
              className="text-xs text-zinc-400 underline hover:text-white"
            >
              I have stored it safely
            </button>
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-[#0c101f]/90 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Webhook className="h-4 w-4 text-violet-300" />
            Nexus API surface (this deployment)
          </h2>
          <Link
            href="/docs#authentication"
            className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Auth docs
          </Link>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Integration routes use server env (e.g. <code className="text-zinc-400">GITHUB_TOKEN</code>). A future
          build would require <code className="text-zinc-400">Authorization: Bearer</code> on ingest using keys you
          mint here.
        </p>

        <div className="mt-4 space-y-2">
          {ENDPOINTS.map((ep) => {
            const id = ep.path.replace(/\//g, "-");
            const isOpen = openDoc === id;
            return (
              <div key={ep.path} className="rounded-xl border border-white/10 bg-black/30">
                <button
                  type="button"
                  onClick={() => setOpenDoc(isOpen ? null : id)}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
                >
                  <span className="font-mono text-xs text-cyan-200">
                    <span className="text-violet-300">{ep.method}</span> {ep.path}
                  </span>
                  <span className="text-[10px] text-zinc-500">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="border-t border-white/10 px-4 py-3 text-xs text-zinc-400">
                    <p>{ep.note}</p>
                    {ep.body && (
                      <p className="mt-2 font-mono text-[11px] text-zinc-500">
                        Body: <span className="text-zinc-300">{ep.body}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
