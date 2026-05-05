import { getJiraConfig } from "./integration-env";

function authHeader(email: string, token: string) {
  const b = Buffer.from(`${email}:${token}`).toString("base64");
  return `Basic ${b}`;
}

function adfParagraph(text: string) {
  const safe = text.slice(0, 32000);
  return {
    type: "doc",
    version: 1,
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: safe }],
      },
    ],
  };
}

export async function verifyJiraProject(projectKey: string) {
  const cfg = getJiraConfig();
  if (!cfg) return { ok: false as const, error: "Set JIRA_HOST, JIRA_EMAIL, JIRA_API_TOKEN on the server" };
  const url = `${cfg.host}/rest/api/3/project/${encodeURIComponent(projectKey)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: authHeader(cfg.email, cfg.token),
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text();
    return { ok: false as const, error: t.slice(0, 500) || `HTTP ${res.status}` };
  }
  const data = (await res.json()) as { name?: string; key?: string };
  return { ok: true as const, name: data.name ?? projectKey, key: data.key ?? projectKey };
}

export async function createJiraIssue(options: {
  projectKey: string;
  summary: string;
  description: string;
  issueType: string;
}) {
  const cfg = getJiraConfig();
  if (!cfg) return { ok: false as const, error: "Jira not configured on server" };
  const url = `${cfg.host}/rest/api/3/issue`;
  const body = {
    fields: {
      project: { key: options.projectKey },
      summary: options.summary.slice(0, 255),
      description: adfParagraph(options.description),
      issuetype: { name: options.issueType },
    },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader(cfg.email, cfg.token),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    return { ok: false as const, error: text.slice(0, 800) || `HTTP ${res.status}` };
  }
  const data = JSON.parse(text) as { key?: string; id?: string };
  const key = data.key;
  const issueUrl = key ? `${cfg.host}/browse/${key}` : cfg.host;
  return { ok: true as const, key: key ?? "", id: data.id ?? "", url: issueUrl };
}
