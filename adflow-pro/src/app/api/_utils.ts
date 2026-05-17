import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/auth/session";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function attachAuthCookie(res: NextResponse, token: string) {
  res.cookies.set(sessionCookieName(), token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set(sessionCookieName(), "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}

export function assertCron(req: Request) {
  const want = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const vercelCron = req.headers.get("x-vercel-cron") === "1";
  if (vercelCron && process.env.VERCEL === "1") return;
  if (want && auth === `Bearer ${want}`) return;
  throw new Error("CRON_UNAUTHORIZED");
}
