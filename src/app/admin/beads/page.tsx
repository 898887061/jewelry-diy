"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface AdminBead {
  id: string;
  title: string;
  handle: string;
  status: string;
  imageUrl: string;
  colorHex: string;
  category: string;
  variants: Array<{ id: string; title: string; price: string }>;
}

export default function BeadListPage() {
  const [beads, setBeads] = useState<AdminBead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchBeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/beads");
      if (!res.ok) throw new Error("加载失败");
      const data = await res.json();
      setBeads(data.beads ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBeads();
  }, [fetchBeads]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`确定要删除「${title}」吗？此操作不可撤销。`)) return;

    // Extract numeric ID from GID
    const numericId = id.replace("gid://shopify/Product/", "");
    try {
      const res = await fetch(`/api/admin/beads/${numericId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("删除失败");
      setBeads((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert("删除失败，请重试");
    }
  }

  const filtered = beads.filter(
    (b) =>
      search.trim() === "" ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[20px] font-semibold text-[#1E2430]">珠子管理</h2>
        <Link
          href="/admin/beads/new"
          className="rounded-full bg-[#D92D33] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_8px_rgba(217,45,51,0.25)]"
        >
          + 新增珠子
        </Link>
      </div>

      <div className="mb-4 rounded-full border border-[#D9DCE3] bg-white px-4 py-2.5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索珠子名称或分类..."
          className="w-full bg-transparent text-[14px] text-[#4A5260] outline-none placeholder:text-[#A0A7B4]"
        />
      </div>

      {loading && (
        <div className="py-12 text-center text-[14px] text-[#7B8391]">加载中...</div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-[#F1B8BB] bg-[#FDEDEE] px-4 py-3 text-[13px] text-[#AE3036]">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="py-12 text-center text-[14px] text-[#7B8391]">
          {beads.length === 0 ? "暂无珠子商品，点击上方按钮添加" : "无匹配结果"}
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((bead) => {
          const numericId = bead.id.replace("gid://shopify/Product/", "");
          return (
            <div
              key={bead.id}
              className="rounded-[16px] border border-[#E3E5EA] bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 shrink-0 rounded-xl border border-[#E8EBF0] shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)]"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${bead.colorHex}dd, ${bead.colorHex})`,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[15px] font-semibold text-[#242A36]">
                      {bead.title}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        bead.status === "ACTIVE"
                          ? "bg-[#E6F9EE] text-[#1A7A42]"
                          : "bg-[#F5F5F5] text-[#8A8A8A]"
                      }`}
                    >
                      {bead.status === "ACTIVE" ? "已上架" : "未上架"}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#808896]">
                    {bead.category} ·{" "}
                    {bead.variants.map((v) => v.title).join(" / ")}
                  </p>
                  <p className="text-[12px] text-[#6A707E]">
                    {bead.variants.map((v) => `¥${v.price}`).join(" / ")}
                  </p>
                </div>
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <Link
                  href={`/admin/beads/${numericId}/edit`}
                  className="rounded-lg border border-[#D9DCE3] bg-white px-3 py-1.5 text-[12px] text-[#596170]"
                >
                  编辑
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(bead.id, bead.title)}
                  className="rounded-lg border border-[#F1B8BB] bg-[#FDEDEE] px-3 py-1.5 text-[12px] text-[#AE3036]"
                >
                  删除
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
