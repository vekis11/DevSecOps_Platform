import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  COOKIE_ENFORCE,
  COOKIE_MODULES,
  hasEngineAccess,
} from "@/lib/subscription";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const modules = request.cookies.get(COOKIE_MODULES)?.value;
  const enforce = request.cookies.get(COOKIE_ENFORCE)?.value;

  const { allowed, module, reason } = hasEngineAccess(pathname, modules, enforce);
  if (allowed) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/billing";
  url.searchParams.set("locked", module ?? "");
  if (reason === "enforce_missing") {
    url.searchParams.set("required", "1");
  }
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/sast", "/sast/:path*", "/dast", "/dast/:path*", "/sca", "/sca/:path*", "/iac", "/iac/:path*", "/secrets", "/secrets/:path*", "/cloud", "/cloud/:path*"],
};
