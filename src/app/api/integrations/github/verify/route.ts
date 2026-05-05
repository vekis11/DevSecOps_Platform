import { NextResponse } from "next/server";
import { verifyRepo } from "@/lib/server/github-live";

export async function POST(request: Request) {
  let body: { org?: string; repo?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const org = body.org?.trim();
  const repo = body.repo?.trim();
  if (!org || !repo) {
    return NextResponse.json({ error: "org and repo required" }, { status: 400 });
  }
  const result = await verifyRepo(org, repo);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, fullName: result.fullName });
}
