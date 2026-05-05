"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { COOKIE_ENFORCE, COOKIE_MODULES } from "@/lib/subscription";
import type { EngineDomain } from "@/lib/scan-domain-config";
import clsx from "clsx";
import { Check, Shield } from "lucide-react";

const ALL: EngineDomain[] = ["sast", "dast", "sca", "iac", "secrets", "cloud"];

const PRESETS: { id: string; label: string; modules: EngineDomain[] | "*" }[] = [
  { id: "full", label: "Full platform (all engines)", modules: "*" },
  { id: "sast", label: "SAST only", modules: ["sast"] },
  { id: "dast", label: "DAST only", modules: ["dast"] },
  { id: "appsec", label: "AppSec bundle (SAST + DAST + SCA)", modules: ["sast", "dast", "sca"] },
  { id: "infra", label: "Infra bundle (IaC + Secrets + Cloud)", modules: ["iac", "secrets", "cloud"] },
];

function setCookie(name: string, value: string, days = 365) {
  const maxAge = days * 86400;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function BillingClient() {
  const sp = useSearchParams();
  const locked = sp.get("locked");
  const required = sp.get("required");

  const [selected, setSelected] = useState<EngineDomain[]>([...ALL]);
  const [enforce, setEnforce] = useState(false);
  const [preset, setPreset] = useState<string>("full");
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    const raw = document.cookie.split(";").find((c) => c.trim().startsWith(`${COOKIE_MODULES}=`));
    const v = raw?.split("=").slice(1).join("=");
    if (v && decodeURIComponent(v) !== "*") {
      try {
        const dec = decodeURIComponent(v);
        if (dec && dec !== "*") {
          setSelected(dec.split(",").map((s) => s.trim().toLowerCase()) as EngineDomain[]);
        }
      } catch {
        /* ignore */
      }
    }
    const en = document.cookie.split(";").find((c) => c.trim().startsWith(`${COOKIE_ENFORCE}=`));
    if (en?.includes("1")) setEnforce(true);
  }, []);

  const applyPreset = (id: string) => {
    setPreset(id);
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    if (p.modules === "*") setSelected([...ALL]);
    else setSelected([...p.modules]);
  };

  const toggle = (m: EngineDomain) => {
    setPreset("custom");
    setSelected((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  const save = useCallback(() => {
    if (selected.length === 0) {
      setSaveMsg("Select at least one engine, or use the Full platform preset.");
      return;
    }
    const value = preset === "full" || selected.length === ALL.length ? "*" : selected.join(",");
    setCookie(COOKIE_MODULES, value);
    setCookie(COOKIE_ENFORCE, enforce ? "1" : "0");
    window.dispatchEvent(new Event("aspm-subscription-changed"));
    setSaveMsg("Saved. Engine navigation and middleware now reflect this plan.");
    setTimeout(() => setSaveMsg(null), 5000);
  }, [selected, enforce, preset]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {(locked || required) && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/25 px-4 py-3 text-sm text-amber-100">
          {required
            ? "Subscription enforcement is on but no plan cookie was set — choose modules below."
            : `Your current plan does not include the ${locked?.toUpperCase()} engine — adjust access below.`}
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-[#0c101f]/90 p-6">
        <div className="flex items-center gap-2 text-white">
          <Shield className="h-5 w-5 text-cyan-400" />
          <h2 className="text-lg font-semibold">Tenant subscription (demo)</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          In production, your billing service issues JWTs or calls your API to set tenant entitlements.
          Here, entitlements are stored in first-party cookies (<code className="text-zinc-500">{COOKIE_MODULES}</code>
          , <code className="text-zinc-500">{COOKIE_ENFORCE}</code>) and enforced by{" "}
          <code className="text-zinc-500">middleware.ts</code> on engine routes.
        </p>

        <div className="mt-6 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Presets</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={clsx(
                  "rounded-lg border px-3 py-2 text-xs font-medium transition",
                  preset === p.id
                    ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-100"
                    : "border-white/10 bg-black/30 text-zinc-300 hover:border-white/20",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Module entitlements</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {ALL.map((m) => (
              <label
                key={m}
                className={clsx(
                  "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm capitalize transition",
                  selected.includes(m)
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                    : "border-white/10 bg-black/25 text-zinc-500",
                )}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-black/50 text-emerald-500"
                  checked={selected.includes(m)}
                  onChange={() => toggle(m)}
                />
                {m}
                {selected.includes(m) && <Check className="ml-auto h-4 w-4 text-emerald-400" />}
              </label>
            ))}
          </div>
        </div>

        <label className="mt-6 flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-white/20 bg-black/50 text-amber-500"
            checked={enforce}
            onChange={(e) => setEnforce(e.target.checked)}
          />
          Enforce subscription (redirect to this page if plan cookie missing or engine not entitled)
        </label>

        <button
          type="button"
          onClick={save}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95"
        >
          Save plan for this browser
        </button>
        {saveMsg && (
          <p
            className={clsx(
              "mt-3 rounded-lg border px-3 py-2 text-sm",
              saveMsg.startsWith("Saved")
                ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-100"
                : "border-amber-500/30 bg-amber-950/30 text-amber-100",
            )}
          >
            {saveMsg}
          </p>
        )}
      </section>
    </div>
  );
}
