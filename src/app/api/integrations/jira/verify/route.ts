import { NextResponse } from "next/server";
import { verifyJiraProject } from "@/lib/server/jira-live";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { projectKey?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const projectKey = body.projectKey?.trim();
  if (!projectKey) {
    return NextResponse.json({ error: "projectKey required" }, { status: 400 });
  }
  const result = await verifyJiraProject(projectKey);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, project: result.name, key: result.key });
}
