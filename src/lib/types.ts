export type ScanCategory = "iac" | "sast" | "dast" | "sca" | "secrets" | "container";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type IntegrationStatus = "connected" | "available" | "planned";

export interface IntegrationTool {
  id: string;
  name: string;
  vendor: string;
  category: ScanCategory | "cicd" | "k8s";
  description: string;
  ingest: ("sarif" | "json" | "api" | "webhook" | "cli")[];
  status: IntegrationStatus;
  docsUrl: string;
}

export interface Finding {
  id: string;
  title: string;
  category: ScanCategory;
  severity: Severity;
  tool: string;
  file: string;
  line: number;
  ruleId: string;
  repo: string;
  branch: string;
  firstSeen: string;
  suppressed: boolean;
  /** Explicit CVE ids when scanners provide them */
  cveIds?: string[];
  ghsaIds?: string[];
  /** SCA: affected package for OSV lookup */
  packageName?: string;
  packageVersion?: string;
  /** OSV ecosystem: npm, PyPI, Go, crates.io, RubyGems, Packagist, Maven, … */
  packageEcosystem?: string;
}

export interface IaCException {
  id: string;
  ruleId: string;
  resourcePath: string;
  line: number;
  reason: string;
  approvedBy: string;
  expiresAt: string;
  createdAt: string;
  engine: "checkov" | "tfsec" | "trivy" | "kics" | "terrascan";
}
