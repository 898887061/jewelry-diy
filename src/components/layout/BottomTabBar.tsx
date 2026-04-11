"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "首页", href: "/", icon: "⌂" },
  { label: "好物", href: "/products", icon: "◌" },
  { label: "DIY", href: "/builder", icon: "⬟" },
  { label: "购物车", href: "/builder?panel=checkout", icon: "◧" },
  { label: "我的", href: "/profile", icon: "◔" },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#DADDE4] bg-[#F8F9FB]/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5 backdrop-blur">
      <ul className="mx-auto grid w-full max-w-[460px] grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href.split("?")[0]);

          return (
            <li key={tab.label}>
              <Link
                href={tab.href}
                className={`flex flex-col items-center justify-center rounded-xl py-0.5 text-[12px] transition active:scale-95 ${
                  isActive
                    ? "text-[#A8242A]"
                    : "text-[#8D94A0] hover:text-[#6A7280]"
                }`}
              >
                <span
                  className={`mb-0.5 text-[20px] leading-none transition ${
                    isActive ? "scale-105" : "opacity-85"
                  }`}
                  aria-hidden
                >
                  {tab.icon}
                </span>
                <span className="leading-none">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
