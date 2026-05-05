import { getGitHubToken } from "./integration-env";

const GH_API = "https://api.github.com";

function headers(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Nexus-ASPM",
  } as const;
}

async function ghJson<T>(token: string, path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(`${GH_API}${path}`, {
    ...init,
    headers: { ...headers(token), ...(init?.headers as object) },
    cache: "no-store",
  });
  const text = await res.text();
  let data: T = undefined as T;
  try {
    data = text ? (JSON.parse(text) as T) : (undefined as T);
  } catch {
    data = text as T;
  }
  return { ok: res.ok, status: res.status, data };
}

export async function verifyRepo(owner: string, repo: string) {
  const token = getGitHubToken();
  if (!token) return { ok: false as const, error: "GITHUB_TOKEN not set on server" };
  const { ok, status, data } = await ghJson<{ full_name?: string; permissions?: { admin?: boolean } }>(
    token,
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
  );
  if (!ok) {
    const msg = typeof data === "object" && data && "message" in data ? String((data as { message: string }).message) : `HTTP ${status}`;
    return { ok: false as const, error: msg };
  }
  return { ok: true as const, fullName: data.full_name ?? `${owner}/${repo}` };
}

export async function resolveWorkflowId(owner: string, repo: string, workflowFile: string) {
  const token = getGitHubToken();
  if (!token) return { ok: false as const, error: "GITHUB_TOKEN not set" };
  const { ok, data } = await ghJson<{ workflows?: { id: number; path: string }[] }>(
    token,
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/workflows`,
  );
  if (!ok || !data?.workflows?.length) {
    return { ok: false as const, error: "Could not list workflows (token needs actions:read)" };
  }
  const file = workflowFile.replace(/^\.github\/workflows\//, "").replace(/^\//, "");
  const wf =
    data.workflows.find((w) => w.path === `.github/workflows/${file}`) ||
    data.workflows.find((w) => w.path.endsWith(`/${file}`)) ||
    data.workflows.find((w) => w.path.endsWith(file));
  if (!wf) {
    return { ok: false as const, error: `No workflow matching "${file}" in repo` };
  }
  return { ok: true as const, workflowId: String(wf.id), path: wf.path };
}

export async function dispatchWorkflow(options: {
  owner: string;
  repo: string;
  workflowFile: string;
  ref: string;
  inputs?: Record<string, string>;
}) {
  const token = getGitHubToken();
  if (!token) return { ok: false as const, error: "GITHUB_TOKEN not set" };
  const resolved = await resolveWorkflowId(options.owner, options.repo, options.workflowFile);
  if (!resolved.ok) return resolved;
  const res = await fetch(
    `${GH_API}/repos/${encodeURIComponent(options.owner)}/${encodeURIComponent(options.repo)}/actions/workflows/${resolved.workflowId}/dispatches`,
    {
      method: "POST",
      headers: { ...headers(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        ref: options.ref,
        inputs: options.inputs ?? {},
      }),
      cache: "no-store",
    },
  );
  if (res.status !== 204) {
    const t = await res.text();
    let msg = t || `HTTP ${res.status}`;
    try {
      const j = JSON.parse(t) as { message?: string };
      if (j.message) msg = j.message;
    } catch {
      /* keep */
    }
    return { ok: false as const, error: msg };
  }
  return { ok: true as const, workflowPath: resolved.path, workflowId: resolved.workflowId };
}

export async function createIssue(options: {
  owner: string;
  repo: string;
  title: string;
  body: string;
  labels?: string[];
}) {
  const token = getGitHubToken();
  if (!token) return { ok: false as const, error: "GITHUB_TOKEN not set" };
  const { ok, status, data } = await ghJson<{ html_url?: string; number?: number }>(
    token,
    `/repos/${encodeURIComponent(options.owner)}/${encodeURIComponent(options.repo)}/issues`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers(token) },
      body: JSON.stringify({
        title: options.title,
        body: options.body,
        labels: options.labels?.filter(Boolean) ?? [],
      }),
    },
  );
  if (!ok) {
    const msg =
      typeof data === "object" && data && "message" in data ? String((data as { message: string }).message) : `HTTP ${status}`;
    return { ok: false as const, error: msg };
  }
  return { ok: true as const, url: data.html_url ?? "", number: data.number };
}
