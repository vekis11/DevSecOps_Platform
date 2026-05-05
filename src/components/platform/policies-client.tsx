"use client";

import { useCallback, useState } from "react";
import {
  CRITICALITY_META,
  DEFAULT_POLICY_PACKS,
  type PolicyPackId,
  type ScanRequirement,
  REQUIREMENT_LABELS,
} from "@/lib/policies-types";
import { readStore, writeStore, STORE_KEYS } from "@/lib/client-store";
import Link from "next/link";
import { Gauge, Save, Shield } from "lucide-react";
import clsx from "clsx";

type PolicyState = Record<PolicyPackId, ScanRequirement>;

function mergeDefaults(loaded: Partial<PolicyState> | undefined): PolicyState {
  const base = { ...DEFAULT_POLICY_PACKS };
  if (!loaded) return base;
  (Object.keys(base) as PolicyPackId[]).forEach((tier) => {
    if (loaded[tier]) base[tier] = { ...base[tier], ...loaded[tier] };
  });
  return base;
}

export function PoliciesClient() {
  const [packs, setPacks] = useState<PolicyState>(() =>
    mergeDefaults(readStore<Partial<PolicyState>>(STORE_KEYS.policyPacks, {})),
  );
  const [tier, setTier] = useState<PolicyPackId>("business_critical");
  const [savedFlash, setSavedFlash] = useState(false);

  const persist = useCallback((next: PolicyState) => {
    writeStore(STORE_KEYS.policyPacks, next);
    setPacks(next);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
  }, []);

  const toggle = (key: keyof ScanRequirement) => {
    const next = {
      ...packs,
      [tier]: { ...packs[tier], [key]: !packs[tier][key] },
    };
    persist(next);
  };

  const meta = CRITICALITY_META[tier];
  const req = packs[tier];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-2xl border border-white/10 bg-[#0c101f]/90 p-6 ring-1 ring-white/[0.04]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Shield className="h-4 w-4 text-cyan-400" />
              Policy packs by business criticality
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
              Applications in{" "}
              <Link href="/portfolio" className="text-cyan-400 hover:text-cyan-300">
                Portfolio
              </Link>{" "}
              inherit scan and merge rules from their tier. Tune each tier below — Nexus evaluates findings against
              these gates (production: server-side policy engine).
            </p>
          </div>
          <button
            type="button"
            onClick={() => persist({ ...DEFAULT_POLICY_PACKS })}
            className="rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5"
          >
            Reset all to defaults
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {(Object.keys(CRITICALITY_META) as PolicyPackId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTier(id)}
              className={clsx(
                "rounded-xl border px-4 py-2 text-left text-sm transition",
                tier === id
                  ? "border-cyan-500/50 bg-cyan-500/10 text-white ring-1 ring-cyan-500/30"
                  : "border-white/10 bg-black/30 text-zinc-400 hover:border-white/20",
              )}
            >
              <span className="font-semibold">{CRITICALITY_META[id].label}</span>
            </button>
          ))}
        </div>

        <div
          className={clsx(
            "mt-6 rounded-2xl border border-white/10 bg-gradient-to-br p-5 ring-1 ring-inset ring-white/[0.06]",
            meta.color,
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Gauge className="h-5 w-5 text-white/90" />
            <h3 className="text-lg font-semibold text-white">{meta.label}</h3>
          </div>
          <p className="mt-2 text-sm text-zinc-300">{meta.description}</p>

          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {(Object.keys(REQUIREMENT_LABELS) as (keyof ScanRequirement)[]).map((key) => (
              <li
                key={key}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/40 px-3 py-3 hover:border-cyan-500/30"
                onClick={() => toggle(key)}
                onKeyDown={(e) => e.key === "Enter" && toggle(key)}
                role="button"
                tabIndex={0}
              >
                <input
                  type="checkbox"
                  readOnly
                  checked={req[key]}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black/60 text-cyan-500"
                />
                <span className="text-sm text-zinc-200">{REQUIREMENT_LABELS[key]}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center gap-3">
            <span
              className={clsx(
                "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium",
                savedFlash ? "bg-emerald-500/20 text-emerald-200" : "bg-white/5 text-zinc-500",
              )}
            >
              <Save className="h-3.5 w-3.5" />
              {savedFlash ? "Saved to local policy store" : "Changes persist in localStorage"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
