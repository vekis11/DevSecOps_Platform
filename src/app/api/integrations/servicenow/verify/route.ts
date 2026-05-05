import { NextResponse } from "next/server";
import { verifyServiceNow } from "@/lib/server/servicenow-live";

export const runtime = "nodejs";

export async function POST() {
  const result = await verifyServiceNow();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
