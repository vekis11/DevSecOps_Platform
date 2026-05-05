"use client";

import { readStore, writeStore, STORE_KEYS } from "@/lib/client-store";
import { BookOpen, CheckCircle2, Circle, GraduationCap, Play } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import clsx from "clsx";

const MODULES = [
  {
    id: "dev-sarif",
    title: "Developers — triage SARIF in Nexus",
    minutes: 25,
    docAnchor: "ingest",
    summary: "Understand rule IDs, fingerprints, and when to file vs fix inline.",
  },
  {
    id: "appsec-policy",
    title: "AppSec — policy packs & exceptions",
    minutes: 40,
    docAnchor: "policies",
    summary: "Tune gates by criticality; govern IaC exceptions with evidence.",
  },
  {
    id: "sre-iac",
    title: "SRE — IaC + drift + deploy windows",
    minutes: 35,
    docAnchor: "overview",
    summary: "Connect pre-deploy checks and post-deploy cloud posture loops.",
  },
  {
    id: "pentest-handoff",
    title: "Everyone — pentest intake & retest",
    minutes: 20,
    docAnchor: "pentesting",
    summary: "What belongs in Nexus vs the PT report, and how retests close risk.",
  },
] as const;

export function TrainingClient() {
  const [done, setDone] = useState<Record<string, boolean>>(() =>
    readStore(STORE_KEYS.trainingProgress, {}),
  );

  const toggle = useCallback((id: string) => {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      writeStore(STORE_KEYS.trainingProgress, next);
      return next;
    });
  }, []);

  const pct = Math.round(
    (MODULES.filter((m) => done[m.id]).length / MODULES.length) * 100,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-950/40 to-[#0c101f] p-6 ring-1 ring-violet-500/20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <GraduationCap className="h-6 w-6 text-violet-300" />
              Role-based enablement
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Interactive checklists tie to Documentation anchors. Progress is stored locally so you can resume a
              self-guided tour before a wider rollout.
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-zinc-500">Completion</p>
            <p className="text-3xl font-semibold text-white">{pct}%</p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {MODULES.map((m) => {
          const complete = Boolean(done[m.id]);
          return (
            <article
              key={m.id}
              className={clsx(
                "flex flex-col rounded-2xl border p-5 transition",
                complete
                  ? "border-emerald-500/35 bg-emerald-950/15 ring-1 ring-emerald-500/20"
                  : "border-white/10 bg-[#0c101f]/90 hover:border-cyan-500/30",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">{m.minutes} min</p>
                  <h3 className="mt-1 text-base font-semibold text-white">{m.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(m.id)}
                  className="shrink-0 rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
                  aria-label={complete ? "Mark incomplete" : "Mark complete"}
                >
                  {complete ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">{m.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/docs#${m.docAnchor}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 hover:border-cyan-500/40"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Read doc section
                </Link>
                <Link
                  href="/analysis"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200"
                >
                  <Play className="h-3.5 w-3.5" />
                  Practice in Analysis
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
