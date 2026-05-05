"use client";

import type { EngineDomain } from "@/lib/scan-domain-config";
import { DOMAIN_CONFIG } from "@/lib/scan-domain-config";
import { ArrowRight, Database, Radio, Shield } from "lucide-react";
import Link from "next/link";

/** Explains that Nexus ASPM is the control plane; scanners and CI feed *into* Nexus — not a broker between vendors and GitHub. */
export function NexusIngestPanel({ domain }: { domain: EngineDomain }) {
  const cfg = DOMAIN_CONFIG[domain];

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0c101f]/90 p-5 shadow-xl shadow-black/40">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Database className="h-4 w-4 text-cyan-400" />
            Nexus ASPM is your posture control plane
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Organizations standardize on <strong className="text-zinc-200">Nexus ASPM</strong> to own risk,
            policies, and remediation — for modern DevSecOps and infrastructure security. Third-party scanners
            (commercial or open source) are <strong className="text-zinc-200">signal sources</strong>: they emit
            SARIF, JSON, or webhooks <strong className="text-zinc-200">into Nexus</strong>. Nexus does not sit
            in the middle routing one vendor to another (for example, Snyk is not a path to GitHub through this
            product); your pipelines and repos connect <strong className="text-zinc-200">to Nexus ASPM</strong> so
            findings and governance land in one place.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-200">
          <Shield className="h-3 w-3" />
          Inbound to Nexus
        </span>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-zinc-400">
        <li className="flex gap-2">
          <Radio className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
          <span>
            <strong className="text-zinc-200">{cfg.label} signals:</strong> configure CI so scan output is
            delivered to Nexus ingest endpoints (SARIF 2.1.0 today). Nexus normalizes, deduplicates, and drives
            workflows (ticketing, exceptions, policy) here — not inside a vendor console.
          </span>
        </li>
        <li className="flex gap-2">
          <Radio className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
          <span>
            <strong className="text-zinc-200">GitHub (above):</strong> bind repositories so{" "}
            <em>your</em> Actions or checks can report status and artifacts <strong className="text-zinc-200">to</strong>{" "}
            Nexus ASPM — Nexus orchestrates what runs in your repo; it does not replace your SCM as the source of
            truth for code.
          </span>
        </li>
      </ul>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/findings"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 hover:border-cyan-500/40 hover:bg-cyan-500/10"
        >
          View unified backlog in Nexus
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/integrations"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 hover:border-cyan-500/40 hover:bg-cyan-500/10"
        >
          Supported signal formats
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <a
          href="/api/ingest/sarif"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 hover:border-cyan-500/40 hover:bg-cyan-500/10"
        >
          Ingest API (GET docs stub)
        </a>
      </div>
    </section>
  );
}
