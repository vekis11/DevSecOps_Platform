/** Browser-only key/value helpers; safe no-ops during SSR. */

export function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode */
  }
}

export const STORE_KEYS = {
  engineGitHub: "aspm-engine-github-v1",
  ticketing: "aspm-ticketing-v1",
  ticketLog: "aspm-ticket-log-v1",
  nexusApiKeys: "aspm-nexus-api-keys-v1",
  policyPacks: "aspm-policy-packs-v1",
  portfolioApps: "aspm-portfolio-apps-v1",
  nexusRole: "aspm-nexus-role-v1",
  trainingProgress: "aspm-training-progress-v1",
} as const;
