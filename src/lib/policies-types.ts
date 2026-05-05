import type { PortfolioCriticality } from "@/lib/portfolio-types";

export type PolicyPackId = PortfolioCriticality;

export type ScanRequirement = {
  sastOnPr: boolean;
  dastQuarterly: boolean;
  scaOnDefaultBranch: boolean;
  iacPreDeploy: boolean;
  secretsOnPr: boolean;
  pentestAnnual: boolean;
  blockMergeOnCritical: boolean;
  exceptionRequiresSecondApproval: boolean;
};

export const DEFAULT_POLICY_PACKS: Record<PolicyPackId, ScanRequirement> = {
  mission_critical: {
    sastOnPr: true,
    dastQuarterly: true,
    scaOnDefaultBranch: true,
    iacPreDeploy: true,
    secretsOnPr: true,
    pentestAnnual: true,
    blockMergeOnCritical: true,
    exceptionRequiresSecondApproval: true,
  },
  business_critical: {
    sastOnPr: true,
    dastQuarterly: true,
    scaOnDefaultBranch: true,
    iacPreDeploy: true,
    secretsOnPr: true,
    pentestAnnual: true,
    blockMergeOnCritical: true,
    exceptionRequiresSecondApproval: true,
  },
  standard: {
    sastOnPr: true,
    dastQuarterly: false,
    scaOnDefaultBranch: true,
    iacPreDeploy: true,
    secretsOnPr: true,
    pentestAnnual: false,
    blockMergeOnCritical: true,
    exceptionRequiresSecondApproval: false,
  },
  internal: {
    sastOnPr: false,
    dastQuarterly: false,
    scaOnDefaultBranch: true,
    iacPreDeploy: false,
    secretsOnPr: true,
    pentestAnnual: false,
    blockMergeOnCritical: false,
    exceptionRequiresSecondApproval: false,
  },
};

export const CRITICALITY_META: Record<
  PolicyPackId,
  { label: string; description: string; color: string }
> = {
  mission_critical: {
    label: "Mission critical",
    description: "Customer-facing revenue, regulated data, or safety systems.",
    color: "from-rose-500/30 to-orange-600/20",
  },
  business_critical: {
    label: "Business critical",
    description: "Core internal workflows with material downtime cost.",
    color: "from-amber-500/25 to-yellow-600/15",
  },
  standard: {
    label: "Standard",
    description: "General apps with moderate blast radius.",
    color: "from-cyan-500/20 to-sky-600/15",
  },
  internal: {
    label: "Internal / low risk",
    description: "Labs, sandboxes, and non-production systems.",
    color: "from-zinc-500/20 to-slate-600/15",
  },
};

export const REQUIREMENT_LABELS: Record<keyof ScanRequirement, string> = {
  sastOnPr: "SAST on every PR to default",
  dastQuarterly: "DAST baseline at least quarterly",
  scaOnDefaultBranch: "SCA on default branch builds",
  iacPreDeploy: "IaC gate before prod deploy",
  secretsOnPr: "Secret scan on PR + pre-merge",
  pentestAnnual: "External pentest or PTaaS annually",
  blockMergeOnCritical: "Block merge on critical findings",
  exceptionRequiresSecondApproval: "IaC exceptions need second approver",
};
