import type { EngineDomain } from "./scan-domain-config";

export interface GitHubEngineBinding {
  connected: boolean;
  org: string;
  repo: string;
  /** workflow_dispatch on default branch */
  workflowFile: string;
  scanOnPush: boolean;
  scanOnPullRequest: boolean;
  /** Treat ASPM / tool exit as required check on PR */
  requiredCheckOnPr: boolean;
  /** ISO timestamp when user clicked Connect */
  connectedAt?: string;
}

export type GitHubEnginesState = Partial<Record<EngineDomain, GitHubEngineBinding>>;

export const defaultGitHubBinding = (): GitHubEngineBinding => ({
  connected: false,
  org: "acme-corp",
  repo: "platform",
  workflowFile: "security-scan.yml",
  scanOnPush: true,
  scanOnPullRequest: true,
  requiredCheckOnPr: true,
});
