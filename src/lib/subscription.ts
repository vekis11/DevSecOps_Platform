import type { EngineDomain } from "@/lib/scan-domain-config";

export const ENGINE_PATH_TO_MODULE: { path: string; module: EngineDomain }[] = [
  { path: "/sast", module: "sast" },
  { path: "/dast", module: "dast" },
  { path: "/sca", module: "sca" },
  { path: "/iac", module: "iac" },
  { path: "/secrets", module: "secrets" },
  { path: "/cloud", module: "cloud" },
];

export const COOKIE_MODULES = "aspm-modules";
export const COOKIE_ENFORCE = "aspm-enforce-subscription";

/** `*` or empty (when absent in middleware we treat as all) = full platform */
export function parseModulesCookie(value: string | undefined): Set<EngineDomain> | "all" {
  if (!value?.trim()) return "all";
  const v = value.trim();
  if (v === "*") return "all";
  const parts = v
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is EngineDomain =>
      ["sast", "dast", "sca", "iac", "secrets", "cloud"].includes(s),
    );
  if (parts.length === 0) return "all";
  return new Set(parts);
}

export function pathnameToEngineModule(pathname: string): EngineDomain | null {
  const hit = ENGINE_PATH_TO_MODULE.find(
    (e) => pathname === e.path || pathname.startsWith(`${e.path}/`),
  );
  return hit?.module ?? null;
}

export function hasEngineAccess(
  pathname: string,
  modulesCookie: string | undefined,
  enforceCookie: string | undefined,
): { allowed: boolean; module: EngineDomain | null; reason?: "enforce_missing" | "not_in_plan" } {
  const mod = pathnameToEngineModule(pathname);
  if (!mod) return { allowed: true, module: null };

  const enforce = enforceCookie === "1";
  const raw = modulesCookie?.trim();

  if (enforce && !raw) {
    return { allowed: false, module: mod, reason: "enforce_missing" };
  }

  if (!raw || raw === "*") {
    return { allowed: true, module: mod };
  }

  const parsed = parseModulesCookie(raw);
  if (parsed === "all") return { allowed: true, module: mod };
  if (parsed.has(mod)) return { allowed: true, module: mod };
  return { allowed: false, module: mod, reason: "not_in_plan" };
}
