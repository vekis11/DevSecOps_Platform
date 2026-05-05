"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readStore, STORE_KEYS } from "@/lib/client-store";
import type { GitHubEnginesState } from "@/lib/github-engine-types";
import { DOMAIN_CONFIG, type EngineDomain } from "@/lib/scan-domain-config";
import { defaultTicketingState } from "@/lib/ticketing-types";
import type { TicketingState } from "@/lib/ticketing-types";
import { GitHubMark } from "@/components/icons/github-mark";
import { useSubscriptionModules, canShowEngine } from "@/hooks/use-subscription-modules";
import { ArrowUpRight, Radio } from "lucide-react";
import clsx from "clsx";

const allDomains: EngineDomain[] = ["sast", "dast", "sca", "iac", "secrets", "cloud"];

type LiveStatus = { github: boolean; jira: boolean; servicenow: boolean };

export function DashboardCommandClient() {
  const modules = useSubscriptionModules();
  const domains = allDomains.filter((d) => canShowEngine(modules, `/${d}`));
  const [gh, setGh] = useState<GitHubEnginesState>({});
  const [tk, setTk] = useState<TicketingState>(defaultTicketingState());
  const [live, setLive] = useState<LiveStatus | null>(null);

  useEffect(() => {
    setGh(readStore(STORE_KEYS.engineGitHub, {}));
    setTk(readStore(STORE_KEYS.ticketing, defaultTicketingState()));
    fetch("/api/integrations/status")
      .then((r) => r.json())
      .then((d: LiveStatus) => setLive(d))
      .catch(() => setLive({ github: false, jira: false, servicenow: false }));
    const onVis = () => {
      setGh(readStore(STORE_KEYS.engineGitHub, {}));
      setTk(readStore(STORE_KEYS.ticketing, defaultTicketingState()));
      fetch("/api/integrations/status")
        .then((r) => r.json())
        .then((d: LiveStatus) => setLive(d))
        .catch(() => setLive({ github: false, jira: false, servicenow: false }));
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const enginesConnected = domains.filter((d) => gh[d]?.connected).length;
  const ticketingLive =
    (tk.jira.connected ? 1 : 0) + (tk.servicenow.connected ? 1 : 0) + (tk.githubIssues.connected ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-black/60 p-4 ring-1 ring-inset ring-white/5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              GitHub scan mesh
            </p>
            <GitHubMark className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
            {enginesConnected}
            <span className="text-base font-normal text-zinc-500">
              {" "}
              / {domains.length || allDomains.length}
            </span>
          </p>
          <p className="text-xs text-zinc-500">
            Entitled engines connected (subscription). Server PAT:{" "}
            <span className={live?.github ? "text-emerald-400/90" : "text-rose-400/90"}>
              {live?.github ? "loaded" : "missing"}
            </span>
            .
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-black/60 p-4 ring-1 ring-inset ring-white/5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Ticketing routes
            </p>
            <Radio className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
            {ticketingLive}
            <span className="text-base font-normal text-zinc-500"> / 3</span>
          </p>
          <p className="text-xs text-zinc-500">
            Jira {live?.jira ? "●" : "○"} · Snow {live?.servicenow ? "●" : "○"} · GH{" "}
            {live?.github ? "●" : "○"} server env
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          Engine room — GitHub workflow_dispatch
        </h2>
        {domains.length === 0 ? (
          <p className="mt-2 text-sm text-amber-200/90">
            No engines in this subscription — open{" "}
            <a href="/billing" className="text-cyan-400 underline">
              Subscriptions
            </a>{" "}
            to add modules.
          </p>
        ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((id) => {
            const c = DOMAIN_CONFIG[id];
            const on = gh[id]?.connected;
            return (
              <Link
                key={id}
                href={`/${id}`}
                className={clsx(
                  "group relative overflow-hidden rounded-2xl border p-4 transition",
                  on
                    ? "border-emerald-500/35 bg-emerald-950/20 hover:border-emerald-400/50"
                    : "border-white/10 bg-[#0c101f]/80 hover:border-cyan-500/30 hover:bg-[#0f1528]",
                )}
              >
                <div
                  className={clsx(
                    "pointer-events-none absolute inset-0 opacity-40 transition group-hover:opacity-60",
                    "bg-gradient-to-br",
                    c.accent,
                  )}
                />
                <div className="relative flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      {c.label}
                    </p>
                    <p className="mt-1 text-sm text-zinc-300">{c.short}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-500 transition group-hover:text-white" />
                </div>
                <p className="relative mt-3 text-[11px] font-medium text-zinc-500">
                  {on ? (
                    <span className="text-emerald-300/90">
                      {gh[id]?.org}/{gh[id]?.repo} · workflow bound
                    </span>
                  ) : (
                    <span>Bind repo + verify PAT</span>
                  )}
                </p>
              </Link>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
