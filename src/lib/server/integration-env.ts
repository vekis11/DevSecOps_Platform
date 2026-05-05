/** Server-only: which live integrations are configured (never expose secret values). */

export function getGitHubToken(): string | undefined {
  return process.env.GITHUB_TOKEN?.trim() || process.env.GH_TOKEN?.trim() || undefined;
}

export function getJiraConfig():
  | { host: string; email: string; token: string }
  | undefined {
  const host = normalizeUrl(process.env.JIRA_HOST);
  const email = process.env.JIRA_EMAIL?.trim();
  const token = process.env.JIRA_API_TOKEN?.trim();
  if (!host || !email || !token) return undefined;
  return { host, email, token };
}

export function getServiceNowConfig():
  | { host: string; user: string; pass: string }
  | { host: string; bearer: string }
  | undefined {
  const host = normalizeInstanceHost(process.env.SERVICENOW_INSTANCE);
  const bearer = process.env.SERVICENOW_ACCESS_TOKEN?.trim();
  if (host && bearer) return { host, bearer };
  const user = process.env.SERVICENOW_USERNAME?.trim();
  const pass = process.env.SERVICENOW_PASSWORD?.trim();
  if (host && user && pass) return { host, user, pass };
  return undefined;
}

export function integrationStatus() {
  return {
    github: Boolean(getGitHubToken()),
    jira: Boolean(getJiraConfig()),
    servicenow: Boolean(getServiceNowConfig()),
    nvdApiKey: Boolean(process.env.NVD_API_KEY?.trim()),
    openai: Boolean(process.env.OPENAI_API_KEY?.trim()),
  };
}

function normalizeUrl(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  let u = raw.trim();
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  return u.replace(/\/$/, "");
}

function normalizeInstanceHost(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  let h = raw.trim().replace(/^https?:\/\//i, "").split("/")[0];
  return h || undefined;
}
