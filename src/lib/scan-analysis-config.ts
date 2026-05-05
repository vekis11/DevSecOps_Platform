import type { LucideIcon } from "lucide-react";
import { Code2, Globe, KeyRound, Layers, Package, Radar, Shield } from "lucide-react";

export type AnalysisScanId = "sast" | "dast" | "sca" | "iac" | "secrets" | "pentest" | "cloud";

export type AnalysisScanMeta = {
  id: AnalysisScanId;
  label: string;
  short: string;
  engineHref?: string;
  accent: string;
  mockOpen: number;
  mockTrend: string;
  icon: LucideIcon;
};

export const ANALYSIS_SCANS: AnalysisScanMeta[] = [
  {
    id: "sast",
    label: "SAST",
    short: "Static analysis on source — control flow, injection, dangerous APIs.",
    engineHref: "/sast",
    accent: "from-violet-500/20 to-fuchsia-600/10",
    mockOpen: 38,
    mockTrend: "-12% vs last sprint",
    icon: Code2,
  },
  {
    id: "dast",
    label: "DAST",
    short: "Authenticated crawling + attack replay against running environments.",
    engineHref: "/dast",
    accent: "from-sky-500/20 to-cyan-600/10",
    mockOpen: 21,
    mockTrend: "stable",
    icon: Globe,
  },
  {
    id: "sca",
    label: "SCA",
    short: "Transitive dependency risk, licenses, and reachable vulnerable paths.",
    engineHref: "/sca",
    accent: "from-emerald-500/20 to-teal-600/10",
    mockOpen: 56,
    mockTrend: "+4 new CVEs",
    icon: Package,
  },
  {
    id: "iac",
    label: "IaC",
    short: "Terraform, CloudFormation, Kubernetes — drift and misconfigurations.",
    engineHref: "/iac",
    accent: "from-amber-500/20 to-orange-600/10",
    mockOpen: 17,
    mockTrend: "-3 after policy pack",
    icon: Layers,
  },
  {
    id: "secrets",
    label: "Secrets",
    short: "Entropy, history scans, and CI log leakage before keys rotate.",
    engineHref: "/secrets",
    accent: "from-rose-500/20 to-red-600/10",
    mockOpen: 4,
    mockTrend: "1 urgent",
    icon: KeyRound,
  },
  {
    id: "pentest",
    label: "Penetration testing",
    short: "Scoped offensive engagements — evidence, retest SLAs, and narrative risk.",
    accent: "from-fuchsia-500/25 to-violet-700/15",
    mockOpen: 9,
    mockTrend: "retest due in 11d",
    icon: Radar,
  },
  {
    id: "cloud",
    label: "Cloud posture",
    short: "CSPM-style controls mapped to CIS and org guardrails.",
    engineHref: "/cloud",
    accent: "from-blue-500/20 to-indigo-600/10",
    mockOpen: 31,
    mockTrend: "-8 after remediations",
    icon: Shield,
  },
];
