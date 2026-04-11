import { redirect } from "next/navigation";
import { getAdminOpenId } from "@/lib/admin/session";
import { getWeChatAuthUrl } from "@/lib/wechat/auth";
import { headers } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const openid = await getAdminOpenId();

  if (!openid) {
    // In production, redirect to WeChat OAuth
    if (process.env.NODE_ENV === "production") {
      const headerStore = await headers();
      const host = headerStore.get("host") ?? "";
      const protocol = headerStore.get("x-forwarded-proto") ?? "https";
      const redirectUri = `${protocol}://${host}/api/admin/auth`;
      const authUrl = getWeChatAuthUrl(redirectUri);
      redirect(authUrl);
    }

    // In development without DEV_ADMIN_OPENID, show message
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[470px] items-center justify-center bg-[#F1F2F5] px-4">
        <div className="rounded-2xl border border-[#E3E5EA] bg-white p-6 text-center">
          <p className="text-[18px] font-semibold text-[#1E2430]">管理后台</p>
          <p className="mt-2 text-[14px] text-[#6E7684]">
            请在 .env.local 中设置 DEV_ADMIN_OPENID 以启用本地开发模式
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[470px] bg-[#F1F2F5]">
      <header className="sticky top-0 z-50 border-b border-[#E1E5EC] bg-[#F1F2F5]/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-semibold text-[#1E2430]">管理后台</h1>
          <nav className="flex gap-2">
            <a
              href="/admin"
              className="rounded-full border border-[#D9DCE3] bg-white px-3 py-1 text-[13px] text-[#596170]"
            >
              总览
            </a>
            <a
              href="/admin/beads"
              className="rounded-full border border-[#D9DCE3] bg-white px-3 py-1 text-[13px] text-[#596170]"
            >
              珠子管理
            </a>
          </nav>
        </div>
      </header>
      <main className="px-4 py-4">{children}</main>
    </div>
  );
}
