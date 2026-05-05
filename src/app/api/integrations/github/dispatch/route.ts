import { NextResponse } from "next/server";
import { dispatchWorkflow } from "@/lib/server/github-live";

export async function POST(request: Request) {
  let body: {
    org?: string;
    repo?: string;
    workflowFile?: string;
    ref?: string;
    inputs?: Record<string, string>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const org = body.org?.trim();
  const repo = body.repo?.trim();
  const workflowFile = body.workflowFile?.trim();
  const ref = body.ref?.trim() || process.env.GITHUB_DEFAULT_BRANCH?.trim() || "main";
  if (!org || !repo || !workflowFile) {
    return NextResponse.json({ error: "org, repo, and workflowFile required" }, { status: 400 });
  }
  const result = await dispatchWorkflow({
    owner: org,
    repo,
    workflowFile,
    ref,
    inputs: body.inputs,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    workflowId: result.workflowId,
    workflowPath: result.workflowPath,
    ref,
  });
}
