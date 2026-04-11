import { NextResponse } from "next/server";
import { getOpenIdByCode } from "@/lib/wechat/auth";
import { isAdminOpenId, createAdminCookieHeaders } from "@/lib/admin/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code parameter" }, { status: 400 });
  }

  try {
    const openid = await getOpenIdByCode(code);

    if (!isAdminOpenId(openid)) {
      return new NextResponse("无权限访问管理后台", { status: 403 });
    }

    const headers = createAdminCookieHeaders(openid);
    return NextResponse.redirect(new URL("/admin", request.url), {
      headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Auth failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
