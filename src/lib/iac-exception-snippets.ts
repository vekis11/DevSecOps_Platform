import type { IaCException } from "./types";

/** Inline suppression snippets aligned with common IaC scanners */
export function exceptionToSnippets(ex: IaCException): Record<string, string> {
  const loc = `${ex.resourcePath}:${ex.line}`;
  switch (ex.engine) {
    case "checkov":
      return {
        Terraform: `# checkov:skip=${ex.ruleId}: ${ex.reason} (ASPM ${ex.id})`,
        "CloudFormation / YAML": `# checkov:skip=${ex.ruleId}: ${ex.reason}`,
        Kubernetes: `# checkov:skip=${ex.ruleId}: ${ex.reason}`,
      };
    case "tfsec":
      return {
        Terraform: `# tfsec:ignore:${ex.ruleId} # ${ex.reason} — ${loc}`,
      };
    case "trivy":
      return {
        Terraform: `# trivy:ignore:${ex.ruleId} # ${ex.reason}`,
        "Generic": `# nosec ${ex.ruleId} — managed exception ${ex.id}`,
      };
    case "kics":
      return {
        IaC: `// kics-scan ignore-line ${ex.reason}`,
      };
    case "terrascan":
      return {
        IaC: `# terrascan:skip=${ex.ruleId} Will fix by ${ex.expiresAt}`,
      };
    default:
      return { Note: ex.reason };
  }
}
