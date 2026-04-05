import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }
  const token = request.cookies.get("adflow_token")?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  try {
    await jose.jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
