"use client";

import { ANALYSIS_SCANS } from "@/lib/scan-analysis-config";
import { DOMAIN_CONFIG, type EngineDomain } from "@/lib/scan-domain-config";
import { GitHubMark } from "@/components/icons/github-mark";
import clsx from "clsx";
import Link from "next/link";
import { ArrowRight, Filter } from "lucide-react";
import { useMemo, useState } from "react";

type Status = "green" | "amber" | "red";

const STATUS: Record<Status, { label: string; class: string }> = {
  green: { label: "Healthy", class: "bg-emerald-500/20 text-emerald-200 ring-emerald-500/40" },
  amber: { label: "Attention", class: "bg-amber-500/20 text-amber-100 ring-amber-500/40" },
  red: { label: "Action", class: "bg-rose-500/20 text-rose-100 ring-rose-500/40" },
};

function pseudoStatus(id: string): Status {
  const x = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  if (x % 5 === 0) return "red";
  if (x % 3 === 0) return "amber";
  return "green";
}

export function ScansMatrixClient() {
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    return ANALYSIS_SCANS.filter((r) => {
      if (!q.trim()) return true;
      const s = `${r.label} ${r.short}`.toLowerCase();
      return s.includes(q.toLowerCase());
    });
  }, [q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2">
          <Filter className="h-4 w-4 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter modalities…"
            className="w-48 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600 md:w-64"
          />
        </div>
        <p className="text-xs text-zinc-500">
          Status chips are synthetic — wire to last ingest heartbeat per tenant.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0c101f]/90">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[11px] uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3">Modality</th>
              <th className="px-4 py-3">Coverage</th>
              <th className="px-4 py-3">Open in Nexus</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const st = pseudoStatus(r.id);
              const raw = r.engineHref?.replace(/^\//, "") ?? "";
              const engineDomain =
                raw && raw in DOMAIN_CONFIG ? (raw as EngineDomain) : undefined;
              const scanners = engineDomain ? DOMAIN_CONFIG[engineDomain].scanners : null;
              return (
                <tr key={r.id} className="border-b border-white/[0.06] text-zinc-300">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{r.label}</p>
                    <p className="mt-0.5 max-w-md text-xs text-zinc-500">{r.short}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {scanners ? (
                      <ul className="max-w-xs space-y-0.5">
                        {scanners.slice(0, 3).map((s) => (
                          <li key={s.name}>{s.name}</li>
                        ))}
                      </ul>
                    ) : (
                      <span>PTaaS / vendor report + retest workflow</span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-white">{r.mockOpen}</td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset",
                        STATUS[st].class,
                      )}
                    >
                      {STATUS[st].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {r.engineHref ? (
                        <Link
                          href={r.engineHref}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                        >
                          Engine
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        <Link
                          href="/analysis"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                        >
                          Analysis
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                      <span className="inline-flex items-center gap-1 text-[10px] text-zinc-600">
                        <GitHubMark className="h-3 w-3" />
                        CI → Nexus
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
