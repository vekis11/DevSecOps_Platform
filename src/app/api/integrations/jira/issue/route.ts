import { NextResponse } from "next/server";
import { createJiraIssue } from "@/lib/server/jira-live";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    projectKey?: string;
    summary?: string;
    description?: string;
    issueType?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const projectKey = body.projectKey?.trim();
  const summary = body.summary?.trim();
  const description = body.description?.trim() ?? "";
  const issueType = body.issueType?.trim() || "Task";
  if (!projectKey || !summary) {
    return NextResponse.json({ error: "projectKey and summary required" }, { status: 400 });
  }
  const result = await createJiraIssue({ projectKey, summary, description, issueType });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, url: result.url, key: result.key, id: result.id });
}
