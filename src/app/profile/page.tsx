"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomTabBar } from "@/components/layout/BottomTabBar";

const quickActions = [
  { title: "我的订单", subtitle: "查看支付与物流进度", value: "12", icon: "◫", href: "/profile/orders" },
  { title: "我的设计", subtitle: "保存的 DIY 方案", value: "8", icon: "⬡", href: "/builder" },
  { title: "收藏好物", subtitle: "你关注的珠子与搭配", value: "24", icon: "◎", href: "/products" },
];

const settingItems = [
  { label: "地址管理", desc: "默认收货地址与联系人", action: "address" },
  { label: "支付方式", desc: "微信 / 支付宝 / 银行卡", action: "payment" },
  { label: "消息通知", desc: "订单提醒与活动通知", action: "notification" },
  { label: "客服与帮助", desc: "售后、保养、常见问题", action: "support" },
];

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed inset-x-0 top-5 z-[100] flex justify-center px-4">
      <div
        className="animate-[fadeSlideIn_0.25s_ease] rounded-xl border border-[#CDE7EA] bg-[#ECF8F9] px-4 py-2.5 text-[13px] text-[#1A6A73] shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
        onClick={onClose}
        role="alert"
      >
        {message}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [toast, setToast] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [userName, setUserName] = useState("珠宝定制会员");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }

  function handleSettingAction(action: string) {
    switch (action) {
      case "address":
        showToast("地址管理功能即将上线，敬请期待");
        break;
      case "payment":
        showToast("结账时可通过 Shopify 选择支付方式");
        break;
      case "notification":
        setNotificationsEnabled((prev) => !prev);
        showToast(notificationsEnabled ? "已关闭消息通知" : "已开启消息通知");
        break;
      case "support":
        showToast("如需帮助请联系客服微信: jewelry_support");
        break;
    }
  }

  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-[470px] overflow-hidden bg-[#F1F2F5] pb-28 pt-5">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_12%_0%,#ffffff_0%,transparent_36%),radial-gradient(circle_at_100%_100%,#e9edf3_0%,transparent_30%)]" />

      <div className="relative px-4">
        <header className="mb-4 rounded-[24px] border border-[#E1E5ED] bg-white p-4 shadow-[0_14px_32px_rgba(38,45,59,0.08)]">
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-[#F8D7DE] via-[#EFD7DA] to-[#DDDCE7] p-[2px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-[20px] text-[#8D3942]">
                珠
              </div>
            </div>

            <div className="flex-1">
              <p className="text-[12px] tracking-[0.18em] text-[#8C93A1]">PROFILE</p>
              {editingName ? (
                <input
                  autoFocus
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onBlur={() => {
                    setEditingName(false);
                    showToast("昵称已更新");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setEditingName(false);
                      showToast("昵称已更新");
                    }
                  }}
                  className="w-full border-b-2 border-[#1F6B72] bg-transparent text-[24px] leading-none tracking-[0.03em] text-[#1E2430] outline-none [font-family:var(--font-display)]"
                />
              ) : (
                <h1 className="text-[30px] leading-none tracking-[0.03em] text-[#1E2430] [font-family:var(--font-display)]">
                  {userName}
                </h1>
              )}
              <p className="mt-1 text-[13px] text-[#6E7684]">@jewelrylover · 已连续打卡 18 天</p>
            </div>

            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="rounded-full border border-[#DBDFE7] bg-[#F7F8FA] px-3 py-1.5 text-[13px] text-[#596170] transition active:scale-95 hover:bg-[#ECEDF0]"
            >
              编辑
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "累计订单", value: "¥ 8,640" },
              { label: "已完成设计", value: "31" },
              { label: "会员等级", value: "Silver" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#E6EAF1] bg-[#F8F9FB] px-2 py-3 text-center">
                <p className="text-[12px] text-[#7B8391]">{item.label}</p>
                <p className="mt-1 text-[15px] font-semibold text-[#202632]">{item.value}</p>
              </div>
            ))}
          </div>
        </header>

        <section className="mb-4 rounded-[22px] border border-[#E3E7EE] bg-[#F6F7FA] p-3">
          <h2 className="mb-2 px-1 text-[20px] font-semibold text-[#232935]">快捷入口</h2>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="flex w-full items-center justify-between rounded-[16px] border border-[#E4E8EF] bg-white px-3 py-3 text-left transition active:scale-[0.98] hover:-translate-y-[1px] hover:shadow-[0_10px_20px_rgba(37,44,59,0.08)]"
              >
                <div className="mr-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#F1F3F8] text-[18px] text-[#5E6574]">
                  {action.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[16px] font-semibold text-[#242A36]">{action.title}</p>
                  <p className="text-[12px] text-[#808896]">{action.subtitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-[18px] font-semibold text-[#1F2633]">{action.value}</p>
                  <p className="text-[12px] text-[#8A92A0]">查看 →</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[22px] border border-[#E3E7EE] bg-[#F6F7FA] p-3">
          <h2 className="mb-2 px-1 text-[20px] font-semibold text-[#232935]">账户设置</h2>
          <div className="space-y-2">
            {settingItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleSettingAction(item.action)}
                className="flex w-full items-center justify-between rounded-[16px] border border-[#E4E8EF] bg-white px-3 py-3 text-left transition active:scale-[0.98] hover:bg-[#FCFCFD]"
              >
                <div>
                  <p className="text-[16px] font-semibold text-[#242A36]">{item.label}</p>
                  <p className="text-[12px] text-[#808896]">
                    {item.action === "notification"
                      ? `${item.desc} · ${notificationsEnabled ? "已开启" : "已关闭"}`
                      : item.desc}
                  </p>
                </div>
                {item.action === "notification" ? (
                  <div
                    className={`h-6 w-10 rounded-full p-0.5 transition ${
                      notificationsEnabled ? "bg-[#1F6B72]" : "bg-[#D1D5DB]"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        notificationsEnabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </div>
                ) : (
                  <span className="text-[18px] text-[#8F97A5]">→</span>
                )}
              </button>
            ))}
          </div>
        </section>
      </div>

      <BottomTabBar />
    </main>
  );
}
