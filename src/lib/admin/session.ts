import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSigningSecret(): string {
  return process.env.WECHAT_SECRET ?? process.env.REVALIDATE_SECRET ?? "dev-secret";
}

function signValue(value: string): string {
  const secret = getSigningSecret();
  const signature = createHmac("sha256", secret).update(value).digest("hex");
  return `${value}.${signature}`;
}

function verifySignedValue(signed: string): string | null {
  const lastDot = signed.lastIndexOf(".");
  if (lastDot === -1) return null;

  const value = signed.slice(0, lastDot);
  const expected = signValue(value);

  if (expected !== signed) return null;
  return value;
}

export function isAdminOpenId(openid: string): boolean {
  const allowedList = process.env.ADMIN_OPENIDS ?? "";
  const allowed = allowedList
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return allowed.includes(openid);
}

export async function getAdminOpenId(): Promise<string | null> {
  // Dev mode bypass
  if (process.env.NODE_ENV === "development") {
    const devOpenId = process.env.DEV_ADMIN_OPENID;
    if (devOpenId) return devOpenId;
  }

  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie) return null;

  const openid = verifySignedValue(cookie.value);
  if (!openid) return null;

  if (!isAdminOpenId(openid)) return null;

  return openid;
}

export function createAdminCookieHeaders(openid: string): Record<string, string> {
  const signed = signValue(openid);
  return {
    "Set-Cookie": `${COOKIE_NAME}=${signed}; Path=/admin; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  };
}

export async function verifyAdminRequest(request: Request): Promise<NextResponse | null> {
  // Dev mode bypass
  if (process.env.NODE_ENV === "development") {
    const devOpenId = process.env.DEV_ADMIN_OPENID;
    if (devOpenId) return null; // allowed
  }

  // Read cookie from request headers
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const openid = verifySignedValue(match[1]);
  if (!openid || !isAdminOpenId(openid)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null; // authorized
}
