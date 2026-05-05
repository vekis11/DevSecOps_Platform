"use client";

import { useCallback, useMemo, useState } from "react";
import {
  DEFAULT_PORTFOLIO,
  type NexusRole,
  type PortfolioApp,
  type PortfolioCriticality,
} from "@/lib/portfolio-types";
import { CRITICALITY_META } from "@/lib/policies-types";
import { readStore, writeStore, STORE_KEYS } from "@/lib/client-store";
import { Building2, Plus, Shield, UserCog, Users } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

function loadApps(): PortfolioApp[] {
  const stored = readStore<PortfolioApp[] | null>(STORE_KEYS.portfolioApps, null);
  if (stored?.length) return stored;
  return DEFAULT_PORTFOLIO;
}

export function PortfolioClient() {
  const [apps, setApps] = useState<PortfolioApp[]>(loadApps);
  const [role, setRole] = useState<NexusRole>(() => readStore(STORE_KEYS.nexusRole, "member"));
  const [name, setName] = useState("");
  const [crit, setCrit] = useState<PortfolioCriticality>("standard");
  const [owner, setOwner] = useState("");
  const [bu, setBu] = useState("");

  const persistApps = useCallback((next: PortfolioApp[]) => {
    writeStore(STORE_KEYS.portfolioApps, next);
    setApps(next);
  }, []);

  const persistRole = (r: NexusRole) => {
    writeStore(STORE_KEYS.nexusRole, r);
    setRole(r);
  };

  const addApp = () => {
    if (!name.trim()) return;
    const row: PortfolioApp = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      name: name.trim(),
      criticality: crit,
      owner: owner.trim() || "unassigned@corp.example",
      businessUnit: bu.trim() || "General",
      lastScanAt: new Date().toISOString(),
      openFindings: 0,
    };
    persistApps([row, ...apps]);
    setName("");
    setOwner("");
    setBu("");
  };

  const isAdmin = role === "admin";

  const summary = useMemo(() => {
    const by: Record<PortfolioCriticality, number> = {
      mission_critical: 0,
      business_critical: 0,
      standard: 0,
      internal: 0,
    };
    apps.forEach((a) => {
      by[a.criticality]++;
    });
    return by;
  }, [apps]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0c101f]/90 p-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Role simulation</p>
          <p className="mt-1 text-sm text-zinc-400">
            Production Nexus binds this to SSO groups. Here it is a local toggle so you can preview admin UX.
          </p>
        </div>
        <div className="flex rounded-xl border border-white/10 bg-black/40 p-1">
          {(["member", "admin"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => persistRole(r)}
              className={clsx(
                "rounded-lg px-4 py-2 text-sm font-medium capitalize transition",
                role === r ? "bg-cyan-500/20 text-white ring-1 ring-cyan-500/40" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {(Object.keys(summary) as PortfolioCriticality[]).map((k) => (
          <div key={k} className="rounded-xl border border-white/10 bg-black/35 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{CRITICALITY_META[k].label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{summary[k]}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0c101f]/90 p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Building2 className="h-4 w-4 text-cyan-400" />
          Register application
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-[11px] text-zinc-500 sm:col-span-2">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-sm text-white"
              placeholder="Claims adjudication API"
            />
          </label>
          <label className="text-[11px] text-zinc-500">
            Criticality
            <select
              value={crit}
              onChange={(e) => setCrit(e.target.value as PortfolioCriticality)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-sm text-white"
            >
              {(Object.keys(CRITICALITY_META) as PortfolioCriticality[]).map((k) => (
                <option key={k} value={k}>
                  {CRITICALITY_META[k].label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[11px] text-zinc-500">
            Business unit
            <input
              value={bu}
              onChange={(e) => setBu(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-sm text-white"
              placeholder="Insurance"
            />
          </label>
          <label className="text-[11px] text-zinc-500 sm:col-span-2">
            Owner (email / group)
            <input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-sm text-white"
              placeholder="appsec@corp.example"
            />
          </label>
          <div className="flex items-end sm:col-span-2">
            <button
              type="button"
              onClick={addApp}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-400 sm:w-auto sm:px-6"
            >
              <Plus className="h-4 w-4" />
              Add to portfolio
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Policies for each tier live in{" "}
          <Link href="/policies" className="text-cyan-400 hover:text-cyan-300">
            Policies
          </Link>
          .
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0c101f]/90 p-6">
        <h2 className="text-sm font-semibold text-white">Applications</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-wide text-zinc-500">
                <th className="pb-2 pr-3">Application</th>
                <th className="pb-2 pr-3">Criticality</th>
                <th className="pb-2 pr-3">Owner</th>
                <th className="pb-2 pr-3">Last scan</th>
                <th className="pb-2">Open</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id} className="border-b border-white/[0.06] text-zinc-300">
                  <td className="py-3 pr-3 font-medium text-white">{a.name}</td>
                  <td className="py-3 pr-3">
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-zinc-400">
                      {CRITICALITY_META[a.criticality].label}
                    </span>
                  </td>
                  <td className="py-3 pr-3 font-mono text-xs text-zinc-500">{a.owner}</td>
                  <td className="py-3 pr-3 text-xs text-zinc-500">
                    {a.lastScanAt ? new Date(a.lastScanAt).toLocaleString() : "—"}
                  </td>
                  <td className="py-3 tabular-nums text-zinc-400">{a.openFindings ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isAdmin && (
        <section className="rounded-2xl border border-violet-500/30 bg-violet-950/20 p-6 ring-1 ring-violet-500/20">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <UserCog className="h-4 w-4 text-violet-300" />
            Admin console (illustrative)
          </h2>
          <p className="mt-2 text-xs text-zinc-400">
            Wire these widgets to your IdP, audit store, and SIEM. Nothing here leaves the browser in this build.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <Users className="h-5 w-5 text-zinc-500" />
              <p className="mt-2 text-sm font-medium text-white">Seat usage</p>
              <p className="mt-1 text-2xl font-semibold text-white">42</p>
              <p className="text-[11px] text-zinc-500">of 250 entitled builders</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <Shield className="h-5 w-5 text-zinc-500" />
              <p className="mt-2 text-sm font-medium text-white">API key audits</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-300">0</p>
              <p className="text-[11px] text-zinc-500">revocations in last 7d (mock)</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <Building2 className="h-5 w-5 text-zinc-500" />
              <p className="mt-2 text-sm font-medium text-white">Business units</p>
              <p className="mt-1 text-2xl font-semibold text-white">6</p>
              <p className="text-[11px] text-zinc-500">with at least one critical app</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
