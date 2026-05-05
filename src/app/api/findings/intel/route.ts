import { NextResponse } from "next/server";
import type { Finding } from "@/lib/types";
import { gatherFindingIntel } from "@/lib/server/gather-finding-intel";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { finding?: Finding };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const finding = body.finding;
  if (!finding?.id || !finding.title) {
    return NextResponse.json({ error: "finding object required" }, { status: 400 });
  }

  try {
    const intel = await gatherFindingIntel(finding);
    return NextResponse.json(intel);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Intel aggregation failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
