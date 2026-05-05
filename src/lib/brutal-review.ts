/** Frank gaps for this local demo — surfaced in-product so buyers and builders align on reality vs roadmap. */

export type BrutalItem = {
  id: string;
  title: string;
  area: "data" | "auth" | "integrations" | "ux" | "scale";
  detail: string;
};

export const BRUTAL_REVIEW_ITEMS: BrutalItem[] = [
  {
    id: "no-db",
    title: "No durable system of record",
    area: "data",
    detail:
      "Findings, portfolio, and policies are mock or browser-local. Production Nexus ASPM needs a tenant-scoped database, event log, and immutable audit trail for compliance.",
  },
  {
    id: "api-keys",
    title: "API keys are simulated in the browser",
    area: "auth",
    detail:
      "Keys you create here never hit a KMS or HSM. Real deployments should issue keys via a vault-backed service, rotate automatically, and bind scopes to OIDC identities.",
  },
  {
    id: "sarif-stub",
    title: "SARIF ingest does not persist",
    area: "integrations",
    detail:
      "POST /api/ingest/sarif acknowledges JSON but does not enqueue work or write rows. Wire to your queue + normalizer + dedupe graph before calling this “production”.",
  },
  {
    id: "cookie-entitlements",
    title: "Subscription gating is cookie-based",
    area: "auth",
    detail:
      "Engine locks read browser cookies. Anyone can edit cookies in devtools. Replace with billing webhooks, signed JWT claims, and server-side enforcement on every API.",
  },
  {
    id: "no-rbac",
    title: "Role “admin” is a UI toggle only",
    area: "auth",
    detail:
      "Portfolio admin panels are illustrative. You still need organization SSO, group policies, break-glass workflows, and least-privilege API scopes per team.",
  },
  {
    id: "pentest",
    title: "Penetration testing is workflow metadata, not findings",
    area: "ux",
    detail:
      "PT engagements produce narratives and evidence outside SARIF. Model retesters, scope packs, and severity mapping explicitly instead of pretending a tab replaces a report.",
  },
  {
    id: "charts-sample",
    title: "Charts and MTTR are sample data",
    area: "data",
    detail:
      "Dashboards look credible but numbers are static mocks. Connect resolution timestamps from Jira/ServiceNow and deploy events from CI/CD for honest trends.",
  },
  {
    id: "rate-limits",
    title: "No rate limiting or tenancy isolation shown",
    area: "scale",
    detail:
      "Public API routes would need per-tenant quotas, bot detection, and abuse analytics before exposing ingest endpoints on the internet.",
  },
];
