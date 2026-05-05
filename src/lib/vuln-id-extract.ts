const CVE_RE = /\bCVE-\d{4}-\d{4,7}\b/gi;
const GHSA_RE = /\bGHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}\b/gi;

function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export function normalizeCve(id: string): string {
  const m = id.toUpperCase().match(/CVE-\d{4}-\d{4,7}/);
  return m ? m[0] : id.toUpperCase();
}

export function normalizeGhsa(id: string): string {
  return id.toUpperCase();
}

/** Pull CVE/GHSA tokens from title, rule id, and explicit finding fields */
export function extractVulnIds(input: {
  title: string;
  ruleId: string;
  cveIds?: string[];
  ghsaIds?: string[];
}): { cves: string[]; ghsas: string[] } {
  const text = `${input.title}\n${input.ruleId}`;
  const fromTextCve = (text.match(CVE_RE) ?? []).map(normalizeCve);
  const fromTextGhsa = (text.match(GHSA_RE) ?? []).map(normalizeGhsa);
  const cves = uniq([
    ...fromTextCve,
    ...(input.cveIds ?? []).map(normalizeCve),
  ]);
  const ghsas = uniq([
    ...fromTextGhsa,
    ...(input.ghsaIds ?? []).map(normalizeGhsa),
  ]);
  return { cves, ghsas };
}

export function mitreCveUrl(cve: string): string {
  return `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${encodeURIComponent(cve)}`;
}

export function nvdCveUrl(cve: string): string {
  return `https://nvd.nist.gov/vuln/detail/${encodeURIComponent(cve)}`;
}

export function osvVulnUrl(id: string): string {
  return `https://osv.dev/vulnerability/${encodeURIComponent(id)}`;
}

export function githubAdvisoryUrl(ghsa: string): string {
  return `https://github.com/advisories/${encodeURIComponent(ghsa)}`;
}
