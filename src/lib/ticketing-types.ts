export interface JiraTicketing {
  connected: boolean;
  siteUrl: string;
  projectKey: string;
  issueType: string;
}

export interface ServiceNowTicketing {
  connected: boolean;
  instanceHost: string;
  table: string;
}

export interface GitHubIssuesTicketing {
  connected: boolean;
  owner: string;
  repo: string;
  label: string;
}

export interface TicketingState {
  jira: JiraTicketing;
  servicenow: ServiceNowTicketing;
  githubIssues: GitHubIssuesTicketing;
}

export const defaultTicketingState = (): TicketingState => ({
  jira: {
    connected: false,
    siteUrl: "https://acme.atlassian.net",
    projectKey: "SEC",
    issueType: "Bug",
  },
  servicenow: {
    connected: false,
    instanceHost: "acme.service-now.com",
    table: "sn_si_incident",
  },
  githubIssues: {
    connected: false,
    owner: "acme-corp",
    repo: "security-backlog",
    label: "aspm-finding",
  },
});

export interface TicketLogEntry {
  id: string;
  target: "jira" | "servicenow" | "github";
  findingId: string;
  title: string;
  createdAt: string;
  /** Simulated deep link */
  url: string;
}
