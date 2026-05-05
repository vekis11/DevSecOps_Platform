import type { Finding } from "@/lib/types";
import {
  extractVulnIds,
  githubAdvisoryUrl,
  mitreCveUrl,
  nvdCveUrl,
  osvVulnUrl,
} from "@/lib/vuln-id-extract";
import { nvdLookupCve } from "./nvd-client";
import { osvGetById, osvQueryByPackage, type OsvVulnSummary } from "./osv-client";
import { aiRemediationSuggestion, heuristicRemediation } from "./remediation-ai";

export type DatabaseLink = { label: string; url: string; source: string };

export async function gatherFindingIntel(finding: Finding): Promise<{
  ids: { cves: string[]; ghsas: string[] };
  databaseLinks: DatabaseLink[];
  osv: OsvVulnSummary[];
  nvd: Awaited<ReturnType<typeof nvdLookupCve>>;
  remediation: {
    heuristic: ReturnType<typeof heuristicRemediation>;
    ai: { markdown: string; model: string } | null;
    aiError?: string;
  };
}> {
  const { cves, ghsas } = extractVulnIds({
    title: finding.title,
    ruleId: finding.ruleId,
    cveIds: finding.cveIds,
    ghsaIds: finding.ghsaIds,
  });

  const osvById = new Map<string, OsvVulnSummary>();

  for (const id of [...cves, ...ghsas].slice(0, 8)) {
    const v = await osvGetById(id);
    if (v) osvById.set(v.id, v);
  }

  if (finding.packageName && finding.packageEcosystem) {
    const pkgVulns = await osvQueryByPackage({
      name: finding.packageName,
      ecosystem: finding.packageEcosystem,
      version: finding.packageVersion,
    });
    for (const v of pkgVulns.slice(0, 15)) {
      if (!osvById.has(v.id)) osvById.set(v.id, v);
    }
  }

  const osv = [...osvById.values()];
  const primaryCve = cves[0];
  const nvd = primaryCve ? await nvdLookupCve(primaryCve) : null;

  const databaseLinks: DatabaseLink[] = [];

  for (const c of cves.slice(0, 6)) {
    databaseLinks.push({ label: `MITRE — ${c}`, url: mitreCveUrl(c), source: "MITRE CVE" });
    databaseLinks.push({ label: `NVD — ${c}`, url: nvdCveUrl(c), source: "NVD" });
    databaseLinks.push({ label: `OSV — ${c}`, url: osvVulnUrl(c), source: "OSV" });
  }
  for (const g of ghsas.slice(0, 6)) {
    databaseLinks.push({ label: `GitHub Advisory — ${g}`, url: githubAdvisoryUrl(g), source: "GitHub" });
    databaseLinks.push({ label: `OSV — ${g}`, url: osvVulnUrl(g), source: "OSV" });
  }
  for (const v of osv) {
    databaseLinks.push({
      label: `OSV record — ${v.id}`,
      url: osvVulnUrl(v.id),
      source: "OSV",
    });
    for (const r of v.references.slice(0, 5)) {
      if (!r.url) continue;
      databaseLinks.push({
        label: r.type ? `${r.type}: ${truncateLabel(r.url, 48)}` : truncateLabel(r.url, 56),
        url: r.url,
        source: "OSV reference",
      });
    }
  }

  if (nvd) {
    databaseLinks.push({ label: `NVD detail — ${nvd.cveId}`, url: nvd.link, source: "NVD" });
  }

  const dedupLinks = dedupeLinks(databaseLinks);

  const heuristic = heuristicRemediation({ finding, osv, nvd });
  let ai: { markdown: string; model: string } | null = null;
  let aiError: string | undefined;
  try {
    ai = await aiRemediationSuggestion({ finding, osv, nvd, heuristic });
  } catch (e) {
    aiError = e instanceof Error ? e.message : "AI remediation failed";
  }

  return {
    ids: { cves, ghsas },
    databaseLinks: dedupLinks,
    osv,
    nvd,
    remediation: { heuristic, ai, aiError },
  };
}

function truncateLabel(url: string, max: number) {
  if (url.length <= max) return url;
  return `${url.slice(0, max - 1)}…`;
}

function dedupeLinks(links: DatabaseLink[]): DatabaseLink[] {
  const seen = new Set<string>();
  const out: DatabaseLink[] = [];
  for (const l of links) {
    if (seen.has(l.url)) continue;
    seen.add(l.url);
    out.push(l);
  }
  return out.slice(0, 40);
}
