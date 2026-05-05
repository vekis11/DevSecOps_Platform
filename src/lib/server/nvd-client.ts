/** NVD CVE API 2.0 — optional NVD_API_KEY for higher rate limits. */

const NVD_BASE = "https://services.nvd.nist.gov/rest/json/cves/2.0";

export type NvdCveBrief = {
  cveId: string;
  description: string;
  link: string;
  cvssScore?: number;
  vector?: string;
};

export async function nvdLookupCve(cveId: string): Promise<NvdCveBrief | null> {
  const key = process.env.NVD_API_KEY?.trim();
  const url = `${NVD_BASE}?cveId=${encodeURIComponent(cveId)}`;
  const headers: Record<string, string> = {};
  if (key) headers.apiKey = key;

  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    vulnerabilities?: {
      cve?: {
        id?: string;
        descriptions?: { lang: string; value: string }[];
        references?: { url?: string }[];
        metrics?: {
          cvssMetricV31?: { cvssData?: { baseScore?: number; vectorString?: string } }[];
          cvssMetricV30?: { cvssData?: { baseScore?: number; vectorString?: string } }[];
        };
      };
    }[];
  };

  const vuln = data.vulnerabilities?.[0]?.cve;
  if (!vuln?.id) return null;

  const enDesc = vuln.descriptions?.find((d) => d.lang === "en") ?? vuln.descriptions?.[0];
  const description = enDesc?.value?.slice(0, 4000) ?? "";

  const m31 = vuln.metrics?.cvssMetricV31?.[0]?.cvssData;
  const m30 = vuln.metrics?.cvssMetricV30?.[0]?.cvssData;
  const cvss = m31 ?? m30;

  return {
    cveId: vuln.id,
    description,
    link: `https://nvd.nist.gov/vuln/detail/${encodeURIComponent(vuln.id)}`,
    cvssScore: cvss?.baseScore,
    vector: cvss?.vectorString,
  };
}
