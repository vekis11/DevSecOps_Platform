import { NextResponse } from "next/server";
import { createServiceNowRecord } from "@/lib/server/servicenow-live";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    table?: string;
    short_description?: string;
    description?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const table = body.table?.trim() || "incident";
  const short_description = body.short_description?.trim();
  const description = body.description?.trim() ?? "";
  if (!short_description) {
    return NextResponse.json({ error: "short_description required" }, { status: 400 });
  }
  const result = await createServiceNowRecord({ table, short_description, description });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    url: result.url,
    number: result.number,
    sysId: result.sysId,
  });
}
