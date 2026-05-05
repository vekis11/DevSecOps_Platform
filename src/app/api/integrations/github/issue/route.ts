import { NextResponse } from "next/server";
import { createIssue } from "@/lib/server/github-live";

export async function POST(request: Request) {
  let body: {
    owner?: string;
    repo?: string;
    title?: string;
    body?: string;
    labels?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const owner = body.owner?.trim();
  const repo = body.repo?.trim();
  const title = body.title?.trim();
  const issueBody = typeof body.body === "string" ? body.body.trim() : "";
  if (!owner || !repo || !title) {
    return NextResponse.json({ error: "owner, repo, and title required" }, { status: 400 });
  }
  const result = await createIssue({
    owner,
    repo,
    title,
    body: issueBody,
    labels: body.labels,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, url: result.url, number: result.number });
}
