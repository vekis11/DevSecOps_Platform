import { Header } from "@/components/shell/header";
import { RiskTrendChart } from "@/components/dashboard/risk-trend";
import { CategoryDonut } from "@/components/dashboard/category-chart";
import { DashboardCommandClient } from "@/components/dashboard/dashboard-command-client";
import { BrutalReviewPanel } from "@/components/dashboard/brutal-review-panel";
import {
  mockFindings,
  riskTrendData,
  countBySeverity,
  countByCategory,
} from "@/lib/findings";
import { Activity, Flame, ShieldCheck, Siren } from "lucide-react";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "cyan" | "violet" | "amber" | "rose";
}) {
  const ring =
    tone === "cyan"
      ? "ring-cyan-500/30"
      : tone === "violet"
        ? "ring-violet-500/30"
        : tone === "amber"
          ? "ring-amber-500/30"
          : "ring-rose-500/35";
  const glow =
    tone === "cyan"
      ? "shadow-cyan-500/10"
      : tone === "violet"
        ? "shadow-violet-500/10"
        : tone === "amber"
          ? "shadow-amber-500/10"
          : "shadow-rose-500/15";
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-[#0c101f]/90 p-5 shadow-lg ${glow} ring-1 ring-inset ${ring}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
        <Icon className="h-4 w-4 text-zinc-300" aria-hidden />
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">{hint}</p>
    </div>
  );
}

export default function DashboardPage() {
  const sev = countBySeverity(mockFindings);
  const cat = countByCategory(mockFindings);
  const open = mockFindings.filter((f) => !f.suppressed).length;
  const critical = sev.critical + sev.high;

  const donutData = Object.entries(cat).map(([name, value]) => ({ name, value }));

  return (
    <>
      <Header
        title="Command center"
        subtitle="Live posture, GitHub-triggered engines, and ticketing fabric — operator-first layout for how teams actually fix risk."
      />
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Open findings"
              value={open}
              hint="Single backlog — dedupe by rule + file + commit in your adapter."
              icon={Siren}
              tone="rose"
            />
            <StatCard
              label="Critical + high"
              value={critical}
              hint="SLA clock starts at first seen in default branch."
              icon={Flame}
              tone="amber"
            />
            <StatCard
              label="MTTR (sample)"
              value="4.2d"
              hint="Wire Jira / ServiceNow webhooks for real resolution timestamps."
              icon={Activity}
              tone="cyan"
            />
            <StatCard
              label="Merge policy pass"
              value="94%"
              hint="Repos with required checks for SAST + SCA + IaC on default."
              icon={ShieldCheck}
              tone="violet"
            />
          </div>

          <DashboardCommandClient />

          <div className="grid min-w-0 gap-6 lg:grid-cols-5">
            <section className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#0c101f]/90 p-6 ring-1 ring-inset ring-white/[0.04] lg:col-span-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-white">Burn-down velocity</h2>
                <span className="rounded-md bg-black/40 px-2 py-0.5 font-mono text-[10px] text-zinc-500">
                  SARIF-backed
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Open vs resolved — correlate with deploy frequency to catch regressions.
              </p>
              <div className="mt-4 min-h-72 w-full min-w-0">
                <RiskTrendChart data={riskTrendData} />
              </div>
            </section>
            <section className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#0c101f]/90 p-6 ring-1 ring-inset ring-white/[0.04] lg:col-span-2">
              <h2 className="text-sm font-semibold text-white">Signal by domain</h2>
              <p className="mt-1 text-xs text-zinc-500">Where your risk concentrates this week</p>
              <div className="min-h-64 w-full min-w-0">
                <CategoryDonut data={donutData} />
              </div>
              <ul className="mt-2 flex flex-wrap gap-2 text-[11px] text-zinc-400">
                {donutData.map((d) => (
                  <li key={d.name} className="rounded-md bg-black/35 px-2 py-0.5 capitalize ring-1 ring-white/10">
                    {d.name}: {d.value}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="rounded-2xl border border-white/[0.08] bg-[#0c101f]/90 p-6 ring-1 ring-inset ring-white/[0.04]">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-sm font-semibold text-white">Severity mix</h2>
              <p className="text-[11px] text-zinc-500">Tune gates: block on critical, cap medium noise.</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-5">
              {(
                [
                  ["critical", sev.critical],
                  ["high", sev.high],
                  ["medium", sev.medium],
                  ["low", sev.low],
                  ["info", sev.info],
                ] as const
              ).map(([k, n]) => (
                <div
                  key={k}
                  className="rounded-xl border border-white/10 bg-black/35 px-3 py-3 text-center ring-1 ring-inset ring-white/[0.04]"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{k}</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{n}</p>
                </div>
              ))}
            </div>
          </section>

          <BrutalReviewPanel />
        </div>
      </div>
    </>
  );
}
