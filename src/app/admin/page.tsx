import Link from "next/link";

const quickLinks = [
  {
    title: "珠子管理",
    desc: "管理所有珠子宝石的上架、编辑、下架",
    href: "/admin/beads",
    icon: "◎",
  },
  {
    title: "新增珠子",
    desc: "上架一款新的珠子宝石",
    href: "/admin/beads/new",
    icon: "＋",
  },
];

export default function AdminDashboard() {
  return (
    <div>
      <section className="mb-6">
        <h2 className="mb-3 text-[22px] font-semibold text-[#1E2430]">总览</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[16px] border border-[#E3E5EA] bg-white px-4 py-4 text-center">
            <p className="text-[12px] text-[#7B8391]">珠子商品</p>
            <p className="mt-1 text-[24px] font-semibold text-[#1E2430]">-</p>
          </div>
          <div className="rounded-[16px] border border-[#E3E5EA] bg-white px-4 py-4 text-center">
            <p className="text-[12px] text-[#7B8391]">分类</p>
            <p className="mt-1 text-[24px] font-semibold text-[#1E2430]">6</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[18px] font-semibold text-[#1E2430]">快捷操作</h2>
        <div className="space-y-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-[16px] border border-[#E3E5EA] bg-white px-4 py-4 transition hover:-translate-y-[1px] hover:shadow-[0_8px_16px_rgba(37,44,59,0.08)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1F3F8] text-[20px] text-[#5E6574]">
                {link.icon}
              </div>
              <div>
                <p className="text-[16px] font-semibold text-[#242A36]">{link.title}</p>
                <p className="text-[12px] text-[#808896]">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
