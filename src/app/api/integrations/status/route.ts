import { NextResponse } from "next/server";
import { integrationStatus } from "@/lib/server/integration-env";

export async function GET() {
  return NextResponse.json(integrationStatus());
}
