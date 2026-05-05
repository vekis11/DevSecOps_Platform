"use client";

import { useEffect, useState } from "react";
import type { EngineDomain } from "@/lib/scan-domain-config";
import { COOKIE_MODULES } from "@/lib/subscription";

function readModules(): "all" | Set<EngineDomain> {
  if (typeof document === "undefined") return "all";
  const raw = document.cookie.split(";").find((c) => c.trim().startsWith(`${COOKIE_MODULES}=`));
  const v = raw?.split("=").slice(1).join("=").trim();
  if (!v) return "all";
  try {
    const dec = decodeURIComponent(v);
    if (!dec || dec === "*") return "all";
    const parts = dec
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s): s is EngineDomain =>
        ["sast", "dast", "sca", "iac", "secrets", "cloud"].includes(s),
      );
    return new Set(parts);
  } catch {
    return "all";
  }
}

export function useSubscriptionModules() {
  const [modules, setModules] = useState<"all" | Set<EngineDomain>>(() => readModules());

  useEffect(() => {
    const onChange = () => setModules(readModules());
    onChange();
    window.addEventListener("aspm-subscription-changed", onChange);
    return () => window.removeEventListener("aspm-subscription-changed", onChange);
  }, []);

  return modules;
}

export function canShowEngine(modules: "all" | Set<EngineDomain>, href: string): boolean {
  if (modules === "all") return true;
  const mod = href.replace(/^\//, "").split("/")[0] as EngineDomain;
  if (!["sast", "dast", "sca", "iac", "secrets", "cloud"].includes(mod)) return true;
  return modules.has(mod);
}
