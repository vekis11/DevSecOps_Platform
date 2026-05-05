"use client";

import { useEffect, useState } from "react";
import type { Finding } from "@/lib/types";
import { ExternalLink, Loader2, Sparkles, X } from "lucide-react";

type IntelResponse = {
  ids: { cves: string[]; ghsas: string[] };
  databaseLinks: { label: string; url: string; source: string }[];
  osv: { id: string; summary?: string }[];
  nvd: { cveId: string; description: string; link: string; cvssScore?: number } | null;
  remediation: {
    heuristic: { title: string; detail: string; urls: string[] }[];
    ai: { markdown: string; model: string } | null;
    aiError?: string;
  };
};

function renderSimpleMarkdown(text: string) {
  const blocks = text.split(/\n{2,}/);
  return blocks.map((block, bi) => {
    const lines = block.split("\n");
    return (
      <div key={bi} className="mb-3 space-y-1 text-sm leading-relaxed text-zinc-300 last:mb-0">
        {lines.map((line, li) => {
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          return (
            <p key={li} className="min-h-[1.25em]">
              {parts.map((part, pi) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong key={pi} className="font-semibold text-white">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                const linkParts = part.split(/(\[[^\]]+\]\([^)]+\))/g);
                return (
                  <span key={pi}>
                    {linkParts.map((lp, lpi) => {
                      const m = lp.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                      if (m) {
                        return (
                          <a
                            key={lpi}
                            href={m[2]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 underline hover:text-cyan-300"
                          >
                            {m[1]}
                          </a>
                        );
                      }
                      return <span key={lpi}>{lp}</span>;
                    })}
                  </span>
                );
              })}
            </p>
          );
        })}
      </div>
    );
  });
}

export function FindingIntelPanel({
  finding,
  open,
  onClose,
}: {
  finding: Finding | null;
  open: boolean;
  onClose: () => void;
}) {
  const [data, setData] = useState<IntelResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !finding) {
      setData(null);
      setErr(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setErr(null);
    fetch("/api/findings/intel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ finding }),
    })
      .then(async (r) => {
        const j = (await r.json()) as IntelResponse & { error?: string };
        if (!r.ok) throw new Error(j.error || r.statusText);
        return j;
      })
      .then((j) => {
        if (!cancelled) setData(j);
      })
      .catch((e) => {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed to load intel");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, finding]);

  if (!open || !finding) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close panel"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-lg flex-col border-l border-white/10 bg-[#070b14] shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-500/90">
              Vuln intel &amp; remediation
            </p>
            <h2 className="mt-1 text-base font-semibold leading-snug text-white">{finding.title}</h2>
            <p className="mt-1 font-mono text-[11px] text-zinc-500">
              {finding.tool} · {finding.ruleId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Querying OSV, NVD, and optional AI…
            </div>
          )}
          {err && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-sm text-rose-100">
              {err}
            </p>
          )}
          {!loading && data && (
            <div className="space-y-6">
              {(data.ids.cves.length > 0 || data.ids.ghsas.length > 0) && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Identifiers</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {data.ids.cves.map((c) => (
                      <span
                        key={c}
                        className="rounded-md bg-rose-500/15 px-2 py-0.5 font-mono text-[11px] text-rose-200 ring-1 ring-rose-500/30"
                      >
                        {c}
                      </span>
                    ))}
                    {data.ids.ghsas.map((g) => (
                      <span
                        key={g}
                        className="rounded-md bg-violet-500/15 px-2 py-0.5 font-mono text-[11px] text-violet-200 ring-1 ring-violet-500/30"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Database &amp; advisory links
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {data.databaseLinks.slice(0, 24).map((l) => (
                    <li key={`${l.url}-${l.label}`}>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-2 text-sm text-cyan-300 hover:text-cyan-200"
                      >
                        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60 group-hover:opacity-100" />
                        <span>
                          <span className="font-medium">{l.label}</span>
                          <span className="ml-2 text-[10px] uppercase tracking-wide text-zinc-600">
                            {l.source}
                          </span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>

              {data.nvd && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">NVD</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {data.nvd.description.slice(0, 900)}
                    {data.nvd.description.length > 900 ? "…" : ""}
                  </p>
                  {data.nvd.cvssScore != null && (
                    <p className="mt-1 text-xs text-zinc-500">CVSS base: {data.nvd.cvssScore}</p>
                  )}
                </section>
              )}

              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Heuristic remediation
                </h3>
                <ul className="mt-2 space-y-3">
                  {data.remediation.heuristic.map((h, i) => (
                    <li key={i} className="rounded-lg border border-white/10 bg-black/30 p-3">
                      <p className="text-sm font-semibold text-white">{h.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-400">{h.detail}</p>
                      {h.urls.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {h.urls.map((u) => (
                            <li key={u}>
                              <a
                                href={u}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="break-all text-[11px] text-cyan-400 hover:underline"
                              >
                                {u}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                  AI remediation agent
                </h3>
                <p className="mt-1 text-[11px] text-zinc-600">
                  Set <code className="text-zinc-500">OPENAI_API_KEY</code> in{" "}
                  <code className="text-zinc-500">.env.local</code> for GPT-backed steps. The model only cites URLs
                  already present in OSV/NVD/heuristic context.
                </p>
                {data.remediation.aiError && (
                  <p className="mt-2 text-xs text-amber-200/90">{data.remediation.aiError}</p>
                )}
                {data.remediation.ai && (
                  <div className="mt-3 rounded-xl border border-violet-500/25 bg-violet-950/20 p-3">
                    <p className="mb-2 text-[10px] uppercase tracking-wide text-violet-300/80">
                      Model: {data.remediation.ai.model}
                    </p>
                    {renderSimpleMarkdown(data.remediation.ai.markdown)}
                  </div>
                )}
                {!data.remediation.ai && !data.remediation.aiError && (
                  <p className="mt-2 text-xs text-zinc-500">No OpenAI key — heuristic guidance only.</p>
                )}
              </section>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
