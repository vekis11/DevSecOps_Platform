export type DocSection = {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
  code?: string;
};

export const DOCS_SECTIONS: DocSection[] = [
  {
    id: "overview",
    title: "Nexus ASPM overview",
    summary:
      "Nexus ASPM is the organization-wide control plane. CI, repositories, and scanners publish signals into Nexus; ticketing and policy live here.",
    bullets: [
      "Use the Scan matrix and Analysis hub to see coverage by modality.",
      "Portfolio classifies each application by business criticality — policies inherit from that tier.",
      "Never store production tokens in this demo UI; use vault + OIDC in real deployments.",
    ],
  },
  {
    id: "authentication",
    title: "Authentication & API keys",
    summary:
      "Server routes that touch third parties read from .env.local. Nexus-native API keys (this build) are browser-simulated — see the brutal review for caveats.",
    bullets: [
      "Create keys in APIs & keys; attach least-privilege scopes per automation.",
      "Rotate keys on a calendar; revoke instantly on incident.",
      "Prefer workload identity (GitHub OIDC, AWS IRSA) over long-lived secrets for ingest pipelines.",
    ],
    code: `curl -sS -X POST https://nexus.example.com/api/ingest/sarif \\
  -H "Authorization: Bearer $NEXUS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d @results.sarif.json`,
  },
  {
    id: "ingest",
    title: "Ingesting SARIF & webhooks",
    summary:
      "POST SARIF 2.1.0 to /api/ingest/sarif (stub here). Production should validate schema, tenant, and signature before enqueue.",
    bullets: [
      "Map tool rule IDs to a stable internal taxonomy for dedupe.",
      "Attach commit SHA, default branch, and build URL for triage context.",
      "Fan out to findings pipeline + policy engine + ticketing rules.",
    ],
  },
  {
    id: "policies",
    title: "Policies by criticality",
    summary:
      "Mission-critical apps carry stricter gates: DAST cadence, pentest evidence, dual approval on exceptions.",
    bullets: [
      "Align tiers with enterprise architecture review outcomes.",
      "Export policy decisions as JSON for auditors (roadmap hook).",
      "Pair with merge checks in GitHub/GitLab — Nexus is policy brain, SCM is enforcement surface.",
    ],
  },
  {
    id: "portfolio",
    title: "Portfolio & admin",
    summary:
      "Register applications, owners, and repos. Admins see synthetic audit widgets — wire to your IdP and SIEM in production.",
    bullets: [
      "Criticality drives default policy pack; overrides require rationale.",
      "Admin role must be server-verified — the UI toggle here is illustrative only.",
    ],
  },
  {
    id: "pentesting",
    title: "Penetration testing in Nexus",
    summary:
      "Pentest is not SARIF-complete. Track scope, evidence packs, retest SLAs, and narrative severity alongside automated findings.",
    bullets: [
      "Attach PT reports as immutable objects with hash + sign-off.",
      "Map PT findings to the same backlog taxonomy as SAST/DAST for unified MTTR.",
      "Require retest evidence before closing critical items on mission-critical tiers.",
    ],
  },
  {
    id: "training",
    title: "Training paths",
    summary:
      "Use the Training hub for role-based curricula. Links jump to deeper sections in this documentation.",
    bullets: [
      "Developers: SARIF triage, secure defaults, secret hygiene.",
      "AppSec: policy tuning, exception governance, PT scoping.",
      "SRE: IaC gates, blast-radius analysis, incident runbooks.",
    ],
  },
];
