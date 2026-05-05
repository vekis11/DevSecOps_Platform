export const API_KEY_SCOPES = [
  "ingest:sarif",
  "findings:read",
  "findings:write",
  "integrations:invoke",
  "policies:read",
  "policies:write",
  "portfolio:read",
  "portfolio:write",
  "admin:audit",
] as const;

export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];

export type NexusApiKey = {
  id: string;
  label: string;
  /** First 12 chars of secret shown after creation; full secret shown once only in UI state */
  prefix: string;
  scopes: ApiKeyScope[];
  createdAt: string;
  lastUsedAt?: string;
  revokedAt?: string;
};

export function generateApiKeySecret(): string {
  const a =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "")
      : `${Date.now()}${Math.random().toString(36).slice(2)}`;
  const b = Math.random().toString(36).slice(2, 10);
  return `nxs_live_${a.slice(0, 24)}_${b}`;
}
