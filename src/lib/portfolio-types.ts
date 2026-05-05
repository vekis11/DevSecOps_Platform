export type PortfolioCriticality = "mission_critical" | "business_critical" | "standard" | "internal";

export type NexusRole = "member" | "admin";

export type PortfolioApp = {
  id: string;
  name: string;
  criticality: PortfolioCriticality;
  owner: string;
  businessUnit: string;
  primaryRepo?: string;
  lastScanAt?: string;
  openFindings?: number;
};

export const DEFAULT_PORTFOLIO: PortfolioApp[] = [
  {
    id: "1",
    name: "Checkout API",
    criticality: "mission_critical",
    owner: "payments@corp.example",
    businessUnit: "Payments",
    primaryRepo: "corp/checkout-api",
    lastScanAt: new Date(Date.now() - 3600e3 * 2).toISOString(),
    openFindings: 12,
  },
  {
    id: "2",
    name: "Partner portal",
    criticality: "business_critical",
    owner: "growth@corp.example",
    businessUnit: "Growth",
    primaryRepo: "corp/partner-portal",
    lastScanAt: new Date(Date.now() - 3600e3 * 30).toISOString(),
    openFindings: 44,
  },
  {
    id: "3",
    name: "HR analytics (internal)",
    criticality: "internal",
    owner: "people-ops@corp.example",
    businessUnit: "People",
    lastScanAt: new Date(Date.now() - 3600e3 * 120).toISOString(),
    openFindings: 128,
  },
];
