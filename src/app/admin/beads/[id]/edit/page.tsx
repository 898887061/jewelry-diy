"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BeadForm } from "@/components/admin/BeadForm";

interface BeadData {
  title: string;
  category: string;
  colorHex: string;
  textureUrl: string;
  variants: Array<{ id: string; title: string; price: string }>;
}

export default function EditBeadPage() {
  const params = useParams<{ id: string }>();
  const [bead, setBead] = useState<BeadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/beads/${params.id}`);
        if (!res.ok) throw new Error("加载失败");
        const data = await res.json();
        setBead(data.bead);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return <div className="py-12 text-center text-[14px] text-[#7B8391]">加载中...</div>;
  }

  if (error || !bead) {
    return (
      <div className="rounded-xl border border-[#F1B8BB] bg-[#FDEDEE] px-4 py-3 text-[13px] text-[#AE3036]">
        {error ?? "商品不存在"}
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-[20px] font-semibold text-[#1E2430]">
        编辑：{bead.title}
      </h2>
      <BeadForm
        productId={params.id}
        initialData={{
          title: bead.title,
          category: bead.category,
          colorHex: bead.colorHex,
          textureUrl: bead.textureUrl,
          variants: bead.variants,
        }}
      />
    </div>
  );
}
