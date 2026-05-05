const OSV_QUERY = "https://api.osv.dev/v1/query";
const OSV_VULN = "https://api.osv.dev/v1/vulns";

export type OsvReference = { type?: string; url?: string };

export type OsvVulnSummary = {
  id: string;
  summary?: string;
  modified?: string;
  published?: string;
  withdrawn?: string | null;
  references: OsvReference[];
  related?: string[];
  database_specific?: Record<string, unknown>;
};

type OsvQueryResponse = { results?: { vulns?: Record<string, unknown>[] }[]; vulns?: Record<string, unknown>[] };

function normalizeOsvVuln(raw: Record<string, unknown>): OsvVulnSummary {
  const refs = Array.isArray(raw.references) ? (raw.references as OsvReference[]) : [];
  const related = Array.isArray(raw.related) ? (raw.related as string[]) : undefined;
  return {
    id: String(raw.id ?? "unknown"),
    summary: raw.summary ? String(raw.summary) : undefined,
    modified: raw.modified ? String(raw.modified) : undefined,
    published: raw.published ? String(raw.published) : undefined,
    withdrawn: raw.withdrawn != null ? String(raw.withdrawn) : null,
    references: refs.filter((r) => r?.url),
    related,
    database_specific:
      raw.database_specific && typeof raw.database_specific === "object"
        ? (raw.database_specific as Record<string, unknown>)
        : undefined,
  };
}

/** OSV: fetch single record by CVE / GHSA / OSV id (canonical API). */
export async function osvGetById(id: string): Promise<OsvVulnSummary | null> {
  const res = await fetch(`${OSV_VULN}/${encodeURIComponent(id.trim())}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const raw = (await res.json()) as Record<string, unknown>;
  return normalizeOsvVuln(raw);
}

/** OSV: query by free-text alias (fallback). */
export async function osvQueryById(query: string): Promise<OsvVulnSummary[]> {
  const res = await fetch(OSV_QUERY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: query.trim() }),
    cache: "no-store",
  });
  if (!res.ok) {
    return [];
  }
  const data = (await res.json()) as OsvQueryResponse;
  const vulns = data.vulns ?? data.results?.flatMap((r) => r.vulns ?? []) ?? [];
  return vulns.map((v) => normalizeOsvVuln(v as Record<string, unknown>));
}

/** OSV: query by package name + ecosystem + optional version */
export async function osvQueryByPackage(input: {
  name: string;
  ecosystem: string;
  version?: string;
}): Promise<OsvVulnSummary[]> {
  const body: Record<string, unknown> = {
    package: { name: input.name.trim(), ecosystem: input.ecosystem.trim() },
  };
  if (input.version?.trim()) {
    body.version = input.version.trim();
  }
  const res = await fetch(OSV_QUERY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as OsvQueryResponse;
  const vulns = data.vulns ?? data.results?.flatMap((r) => r.vulns ?? []) ?? [];
  return vulns.map((v) => normalizeOsvVuln(v as Record<string, unknown>));
}
