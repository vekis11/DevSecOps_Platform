"use client";

import { ANALYSIS_SCANS, type AnalysisScanId } from "@/lib/scan-analysis-config";
import clsx from "clsx";
import Link from "next/link";
import { Activity, ArrowUpRight, BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";

function MiniBars({ seed }: { seed: number }) {
  const heights = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => 20 + ((seed + i * 7) % 55));
  }, [seed]);
  return (
    <div className="flex h-16 items-end gap-1">
      {heights.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t bg-gradient-to-t from-cyan-500/40 to-violet-500/50"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

export function AnalysisHubClient() {
  const [tab, setTab] = useState<AnalysisScanId>("sast");
  const active = ANALYSIS_SCANS.find((s) => s.id === tab) ?? ANALYSIS_SCANS[0];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap">
        {ANALYSIS_SCANS.map((s) => {
          const Icon = s.icon;
          const on = tab === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setTab(s.id)}
              className={clsx(
                "flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition",
                on
                  ? "border-cyan-500/50 bg-cyan-500/15 text-white ring-1 ring-cyan-500/35"
                  : "border-white/10 bg-black/30 text-zinc-400 hover:border-white/25 hover:text-zinc-200",
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" />
              <span className="font-medium">{s.label}</span>
            </button>
          );
        })}
      </div>

      <section
        className={clsx(
          "relative overflow-hidden rounded-2xl border border-white/10 p-6 ring-1 ring-inset ring-white/[0.05]",
          "bg-gradient-to-br from-[#0c101f] to-black/80",
        )}
      >
        <div
          className={clsx(
            "pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl opacity-50",
            "bg-gradient-to-br",
            active.accent,
          )}
        />
        <div className="relative grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              <BarChart3 className="h-3.5 w-3.5" />
              Analysis lens
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-white">{active.label}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{active.short}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {active.engineHref ? (
                <Link
                  href={active.engineHref}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
                >
                  Open engine room
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/docs#pentesting"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-cyan-500/40"
                >
                  Pentest documentation
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
              <Link
                href="/findings"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5"
              >
                View findings backlog
              </Link>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Signal health (sample)</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-white">{active.mockOpen}</p>
            <p className="text-xs text-zinc-500">open items in Nexus for this modality</p>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-cyan-300/90">
              <Activity className="h-3.5 w-3.5" />
              {active.mockTrend}
            </p>
            <div className="mt-4">
              <MiniBars seed={active.mockOpen} />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0c101f]/90 p-5">
        <h3 className="text-sm font-semibold text-white">Cross-modality checklist</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Use this during architecture review — each row should have an owner and evidence in Nexus.
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-zinc-300 md:grid-cols-2">
          <li className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">SAST + SCA agree on reachable paths</li>
          <li className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">DAST covers authenticated flows</li>
          <li className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">IaC matches runtime (drift checks)</li>
          <li className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">Secrets + deps scanned pre-merge</li>
          <li className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">Pentest findings retested before close</li>
          <li className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">Cloud controls mapped to CIS / org guardrails</li>
        </ul>
      </section>
    </div>
  );
}
