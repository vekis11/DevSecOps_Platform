import type { Finding } from "@/lib/types";
import type { OsvVulnSummary } from "./osv-client";
import type { NvdCveBrief } from "./nvd-client";

function truncate(s: string, max: number) {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

/** Deterministic remediation bullets from OSV/NVD only (no LLM). */
export function heuristicRemediation(input: {
  finding: Finding;
  osv: OsvVulnSummary[];
  nvd: NvdCveBrief | null;
}): { title: string; detail: string; urls: string[] }[] {
  const out: { title: string; detail: string; urls: string[] }[] = [];
  const seen = new Set<string>();

  if (input.nvd?.description) {
    out.push({
      title: "NVD — official description & metrics",
      detail: truncate(input.nvd.description, 600),
      urls: [input.nvd.link],
    });
    seen.add(input.nvd.link);
  }

  for (const v of input.osv) {
    const advisories = v.references
      .filter((r) => r.url && /ADVISORY|GITHUB|WEB/i.test(r.type ?? "WEB"))
      .map((r) => r.url as string);
    const unique = advisories.filter((u) => {
      if (seen.has(u)) return false;
      seen.add(u);
      return true;
    });

    if (unique.length) {
      out.push({
        title: `OSV — ${v.id}`,
        detail: v.summary ? truncate(v.summary, 400) : "See linked advisories for vendor guidance and fixed versions.",
        urls: unique.slice(0, 6),
      });
    } else if (v.summary) {
      out.push({
        title: `OSV — ${v.id}`,
        detail: truncate(v.summary, 500),
        urls: [`https://osv.dev/vulnerability/${encodeURIComponent(v.id)}`],
      });
    }
  }

  if (
    input.finding.packageName &&
    input.finding.packageEcosystem &&
    input.osv.length === 0 &&
    !input.nvd
  ) {
    const hint =
      input.finding.packageVersion != null
        ? `Upgrade ${input.finding.packageName}@${input.finding.packageVersion} (${input.finding.packageEcosystem}) using vendor advisories once OSV/NVD match this rule.`
        : `Upgrade ${input.finding.packageName} on ${input.finding.packageEcosystem} per vendor fixed ranges.`;
    out.push({
      title: "Dependency remediation (SCA)",
      detail: hint,
      urls: [`https://osv.dev/list?q=${encodeURIComponent(input.finding.packageName)}&ecosystem=${encodeURIComponent(input.finding.packageEcosystem)}`],
    });
  }

  return out.slice(0, 8);
}

export async function aiRemediationSuggestion(input: {
  finding: Finding;
  osv: OsvVulnSummary[];
  nvd: NvdCveBrief | null;
  heuristic: ReturnType<typeof heuristicRemediation>;
}): Promise<{ markdown: string; model: string } | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const allowedUrls = [
    ...input.heuristic.flatMap((h) => h.urls),
    ...input.osv.flatMap((v) => v.references.map((r) => r.url).filter(Boolean) as string[]),
    ...(input.nvd ? [input.nvd.link] : []),
  ];
  const uniqueUrls = [...new Set(allowedUrls)].slice(0, 40);

  const payload = {
    finding: {
      id: input.finding.id,
      title: input.finding.title,
      category: input.finding.category,
      severity: input.finding.severity,
      ruleId: input.finding.ruleId,
      file: input.finding.file,
      line: input.finding.line,
      packageName: input.finding.packageName,
      packageVersion: input.finding.packageVersion,
      packageEcosystem: input.finding.packageEcosystem,
      cveIds: input.finding.cveIds,
    },
    nvd_summary: input.nvd
      ? { cve: input.nvd.cveId, cvss: input.nvd.cvssScore, vector: input.nvd.vector }
      : null,
    osv_ids: input.osv.map((v) => v.id),
    heuristic_titles: input.heuristic.map((h) => h.title),
    allowed_reference_urls: uniqueUrls,
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a senior application security engineer. Given a security finding and vulnerability database context, output STRICT JSON with keys: summary (string, 2-3 sentences), actions (array of {step, urls}) where each urls array contains ONLY URLs from allowed_reference_urls in the user message. Never invent CVE numbers or URLs. If unsure, say to follow the linked advisories.",
        },
        {
          role: "user",
          content: JSON.stringify(payload),
        },
      ],
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${truncate(t, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) return null;

  let parsed: { summary?: string; actions?: { step?: string; urls?: string[] }[] };
  try {
    parsed = JSON.parse(raw) as typeof parsed;
  } catch {
    return { markdown: raw, model };
  }

  const parts: string[] = [];
  if (parsed.summary) parts.push(`### AI remediation summary\n\n${parsed.summary}`);
  if (parsed.actions?.length) {
    parts.push(
      "\n### Suggested actions\n\n" +
        parsed.actions
          .map((a, i) => {
            const step = a.step ?? "";
            const urls = (a.urls ?? [])
              .filter((u) => uniqueUrls.includes(u))
              .map((u) => `- [${u}](${u})`)
              .join("\n");
            return `**${i + 1}.** ${step}${urls ? `\n${urls}` : ""}`;
          })
          .join("\n\n"),
    );
  }
  return { markdown: parts.join("\n") || raw, model };
}
