import type { Finding, Severity, ScanCategory } from "./types";

export const mockFindings: Finding[] = [
  {
    id: "f-1",
    title: "S3 bucket without encryption at rest",
    category: "iac",
    severity: "high",
    tool: "Checkov",
    file: "infra/modules/s3/main.tf",
    line: 42,
    ruleId: "CKV_AWS_19",
    repo: "platform/infra",
    branch: "main",
    firstSeen: "2026-05-01",
    suppressed: false,
  },
  {
    id: "f-2",
    title: "SQL injection risk in user search",
    category: "sast",
    severity: "critical",
    tool: "Semgrep",
    file: "api/src/users/search.ts",
    line: 88,
    ruleId: "javascript.express.security.injection.raw-query",
    repo: "platform/api",
    branch: "feat/search",
    firstSeen: "2026-05-03",
    suppressed: false,
  },
  {
    id: "f-3",
    title: "Prototype pollution in lodash dependency",
    category: "sca",
    severity: "high",
    tool: "Snyk",
    file: "package-lock.json",
    line: 0,
    ruleId: "SNYK-JS-LODASH-590103",
    repo: "platform/web",
    branch: "main",
    firstSeen: "2026-04-28",
    suppressed: false,
    cveIds: ["CVE-2020-8203"],
    packageName: "lodash",
    packageVersion: "4.17.20",
    packageEcosystem: "npm",
  },
  {
    id: "f-4",
    title: "Missing Content-Security-Policy header",
    category: "dast",
    severity: "medium",
    tool: "OWASP ZAP",
    file: "https://staging.app.example/login",
    line: 0,
    ruleId: "10038",
    repo: "platform/web",
    branch: "staging",
    firstSeen: "2026-05-02",
    suppressed: false,
  },
  {
    id: "f-5",
    title: "High-entropy string resembling AWS key",
    category: "secrets",
    severity: "critical",
    tool: "TruffleHog",
    file: "scripts/legacy-migrate.sh",
    line: 17,
    ruleId: "aws",
    repo: "platform/ops",
    branch: "hotfix/migrate",
    firstSeen: "2026-05-04",
    suppressed: false,
  },
  {
    id: "f-6",
    title: "Security group allows 0.0.0.0/0 on SSH",
    category: "iac",
    severity: "critical",
    tool: "tfsec",
    file: "infra/network/sg.tf",
    line: 23,
    ruleId: "aws-ec2-no-public-ingress-sgr",
    repo: "platform/infra",
    branch: "main",
    firstSeen: "2026-04-20",
    suppressed: true,
  },
];

export function countBySeverity(findings: Finding[]): Record<Severity, number> {
  const init: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };
  for (const f of findings) {
    if (!f.suppressed) init[f.severity]++;
  }
  return init;
}

export function countByCategory(findings: Finding[]): Record<ScanCategory, number> {
  const cats: ScanCategory[] = ["iac", "sast", "dast", "sca", "secrets", "container"];
  const init = Object.fromEntries(cats.map((c) => [c, 0])) as Record<ScanCategory, number>;
  for (const f of findings) {
    if (!f.suppressed && f.category !== "container") init[f.category]++;
  }
  return init;
}

export const riskTrendData = [
  { week: "W1", open: 42, fixed: 18 },
  { week: "W2", open: 38, fixed: 22 },
  { week: "W3", open: 31, fixed: 28 },
  { week: "W4", open: 27, fixed: 31 },
  { week: "W5", open: 22, fixed: 35 },
  { week: "W6", open: 19, fixed: 38 },
];
