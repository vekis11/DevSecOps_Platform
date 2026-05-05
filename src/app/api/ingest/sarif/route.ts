import { NextResponse } from "next/server";

/** Stub: accept SARIF 2.1.0 JSON; persist to your store in a real deployment. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const version =
    body && typeof body === "object" && "$schema" in body
      ? String((body as { $schema?: string }).$schema ?? "")
      : "";

  return NextResponse.json({
    accepted: true,
    message:
      "SARIF received (demo mode — not stored). Wire this handler to your DB or queue.",
    hint:
      "From CI, POST SARIF (Checkov, Semgrep, Trivy, etc.) to Nexus ASPM — findings land in the unified backlog, not in a vendor-to-SCM chain.",
    schemaNote: version || "no $schema field",
    receivedAt: new Date().toISOString(),
  });
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/ingest/sarif",
    method: "POST",
    contentType: "application/json",
    description: "SARIF 2.1.0 ingestion stub for local Nexus ASPM",
  });
}
