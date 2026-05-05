export type EngineDomain = "sast" | "dast" | "sca" | "iac" | "secrets" | "cloud";

export interface DomainConfig {
  id: EngineDomain;
  label: string;
  short: string;
  accent: string;
  /** What breaks in the real world — design for operator truth */
  brutalRealities: string[];
  defaultWorkflow: string;
  scanners: { name: string; ingest: string }[];
}

export const DOMAIN_CONFIG: Record<EngineDomain, DomainConfig> = {
  sast: {
    id: "sast",
    label: "SAST",
    short: "Static code",
    accent: "from-violet-500/30 to-fuchsia-500/20",
    brutalRealities: [
      "Noise without reachability = ignored backlog. Pair SAST with SCA reachability + ownership.",
      "Default branches drift from PR checks — scan merge queues and default branch nightly.",
      "Custom rules rot: pin Semgrep packs and CodeQL packs to SHAs like prod dependencies.",
    ],
    defaultWorkflow: "security-sast.yml",
    scanners: [
      { name: "Semgrep", ingest: "SARIF" },
      { name: "CodeQL", ingest: "SARIF" },
      { name: "Sonar / Checkmarx", ingest: "API + SARIF" },
    ],
  },
  dast: {
    id: "dast",
    label: "DAST",
    short: "Runtime web/API",
    accent: "from-rose-500/30 to-orange-500/20",
    brutalRealities: [
      "Unauthenticated scans miss 80% of abuse cases — drive auth from vault + OIDC test users.",
      "Ephemeral env URLs change every deploy — bind scans to deployment correlation IDs.",
      "Flaky spider timeboxes hide XSS — gate on OpenAPI coverage + session replay checks.",
    ],
    defaultWorkflow: "security-dast.yml",
    scanners: [
      { name: "OWASP ZAP", ingest: "SARIF / API" },
      { name: "Nuclei", ingest: "JSON / SARIF" },
      { name: "StackHawk / Burp CI", ingest: "API" },
    ],
  },
  sca: {
    id: "sca",
    label: "SCA",
    short: "Dependencies & SBOM",
    accent: "from-amber-500/30 to-yellow-500/15",
    brutalRealities: [
      "Transitive CVEs without exploit intel burn teams out — overlay EPSS, KEV, and vendor reachability.",
      "Lockfile-only scans miss unpinned Docker/OS — scan images + base images as first-class.",
      "License policy must block merges, not email — enforce in required GitHub/GitLab checks.",
    ],
    defaultWorkflow: "security-sca.yml",
    scanners: [
      { name: "Snyk / OSV", ingest: "API / SARIF" },
      { name: "Grype / Trivy SBOM", ingest: "SARIF" },
      { name: "Dependabot / Renovate", ingest: "Webhook" },
    ],
  },
  iac: {
    id: "iac",
    label: "IaC",
    short: "Terraform / K8s / CFN",
    accent: "from-cyan-500/30 to-sky-500/15",
    brutalRealities: [
      "Plan-time != apply-time — run policy on rendered manifests and cloud drift, not only HCL.",
      "Inline skips without expiry become permanent debt — pair with ASPM exceptions + owners.",
      "Modules reused across envs amplify blast radius — path-based policies per account/OU.",
    ],
    defaultWorkflow: "security-iac.yml",
    scanners: [
      { name: "Checkov / tfsec", ingest: "SARIF" },
      { name: "Trivy config / KICS", ingest: "SARIF" },
      { name: "OPA / Conftest", ingest: "JSON" },
    ],
  },
  secrets: {
    id: "secrets",
    label: "Secrets",
    short: "Leak detection",
    accent: "from-pink-500/35 to-red-500/20",
    brutalRealities: [
      "Push protection stops new leaks; historical scans still need rotation playbooks + break-glass.",
      "Verified vs unverified findings need different SLAs — don’t ticket noise like incidents.",
      "CI logs and build caches exfiltrate tokens — scan artifacts and runner layers, not only git.",
    ],
    defaultWorkflow: "security-secrets.yml",
    scanners: [
      { name: "TruffleHog", ingest: "JSON / SARIF" },
      { name: "Gitleaks", ingest: "SARIF" },
      { name: "GitHub push protection", ingest: "Webhook" },
    ],
  },
  cloud: {
    id: "cloud",
    label: "Cloud security",
    short: "CSPM / IAM / drift",
    accent: "from-emerald-500/25 to-teal-500/15",
    brutalRealities: [
      "Point-in-time CSPM misses attacker persistence — correlate with CI, K8s admission, and runtime.",
      "Over-privileged CI OIDC roles are the new long-lived keys — scope subjects + audience strictly.",
      "Multi-cloud requires one graph — normalize OPA, Prowler, and cloud APIs into one finding model.",
    ],
    defaultWorkflow: "security-cloud.yml",
    scanners: [
      { name: "Prowler / ScoutSuite", ingest: "JSON" },
      { name: "Wiz / Orca / Prisma", ingest: "API" },
      { name: "CloudTrail + Detections", ingest: "Webhook" },
    ],
  },
};
