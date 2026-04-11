"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["白水晶", "紫水晶", "黄水晶", "粉水晶", "黑曜石", "其他"];

interface VariantInput {
  id?: string;
  title: string;
  price: string;
}

interface BeadFormProps {
  initialData?: {
    title: string;
    category: string;
    colorHex: string;
    textureUrl: string;
    variants: VariantInput[];
  };
  productId?: string;
}

export function BeadForm({ initialData, productId }: BeadFormProps) {
  const router = useRouter();
  const isEdit = Boolean(productId);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [category, setCategory] = useState(initialData?.category ?? CATEGORIES[0]);
  const [colorHex, setColorHex] = useState(initialData?.colorHex ?? "#CCCCCC");
  const [textureUrl, setTextureUrl] = useState(initialData?.textureUrl ?? "");
  const [variants, setVariants] = useState<VariantInput[]>(
    initialData?.variants ?? [{ title: "8mm", price: "10" }],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addVariant() {
    setVariants((prev) => [...prev, { title: "", price: "" }]);
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function updateVariant(index: number, field: "title" | "price", value: string) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const body = {
      title,
      category,
      colorHex,
      textureUrl: textureUrl || undefined,
      variants: variants.filter((v) => v.title && v.price),
    };

    try {
      const url = isEdit ? `/api/admin/beads/${productId}` : "/api/admin/beads";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? data.errors?.[0]?.message ?? "保存失败");
      }

      router.push("/admin/beads");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-[#F1B8BB] bg-[#FDEDEE] px-4 py-3 text-[13px] text-[#AE3036]">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="mb-1 block text-[13px] font-semibold text-[#4A5260]">
          珠子名称
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="如：净体白水晶"
          className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-3 text-[14px] text-[#1E2430] outline-none focus:border-[#1F6B72]"
        />
      </div>

      {/* Category */}
      <div>
        <label className="mb-1 block text-[13px] font-semibold text-[#4A5260]">
          分类
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full border px-3 py-1.5 text-[13px] transition ${
                category === cat
                  ? "border-[#1F6B72] bg-[#1F6B72] text-white"
                  : "border-[#D9DCE3] bg-white text-[#596170]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="mb-1 block text-[13px] font-semibold text-[#4A5260]">
          颜色
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={colorHex}
            onChange={(e) => setColorHex(e.target.value)}
            className="h-10 w-10 cursor-pointer rounded-lg border border-[#D9DCE3]"
          />
          <input
            type="text"
            value={colorHex}
            onChange={(e) => setColorHex(e.target.value)}
            pattern="^#[0-9A-Fa-f]{6}$"
            className="flex-1 rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[14px] text-[#1E2430] outline-none"
          />
          <div
            className="h-10 w-10 rounded-full border border-[#E3E5EA] shadow-inner"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${colorHex}dd, ${colorHex})`,
            }}
          />
        </div>
      </div>

      {/* Texture URL */}
      <div>
        <label className="mb-1 block text-[13px] font-semibold text-[#4A5260]">
          纹理图片 URL (可选)
        </label>
        <input
          type="url"
          value={textureUrl}
          onChange={(e) => setTextureUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-3 text-[14px] text-[#1E2430] outline-none focus:border-[#1F6B72]"
        />
      </div>

      {/* Variants */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-[13px] font-semibold text-[#4A5260]">
            尺寸变体
          </label>
          <button
            type="button"
            onClick={addVariant}
            className="rounded-full border border-[#D9DCE3] bg-white px-3 py-1 text-[12px] text-[#596170]"
          >
            + 添加变体
          </button>
        </div>

        <div className="space-y-2">
          {variants.map((variant, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                required
                value={variant.title}
                onChange={(e) => updateVariant(index, "title", e.target.value)}
                placeholder="尺寸 (如 8mm)"
                className="flex-1 rounded-xl border border-[#D9DCE3] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#1F6B72]"
              />
              <div className="flex items-center gap-1">
                <span className="text-[13px] text-[#7B8391]">¥</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={variant.price}
                  onChange={(e) => updateVariant(index, "price", e.target.value)}
                  placeholder="价格"
                  className="w-20 rounded-xl border border-[#D9DCE3] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#1F6B72]"
                />
              </div>
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="rounded-lg p-2 text-[14px] text-[#AE3036] hover:bg-[#FDEDEE]"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-[16px] border border-[#E3E5EA] bg-[#F7F8FA] p-4">
        <p className="mb-2 text-[12px] text-[#7B8391]">预览</p>
        <div className="flex items-center gap-3">
          <div
            className="h-14 w-14 rounded-full border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${colorHex}dd, ${colorHex})`,
            }}
          />
          <div>
            <p className="text-[15px] font-semibold text-[#242A36]">
              {title || "珠子名称"}
            </p>
            <p className="text-[12px] text-[#808896]">
              {category} · {variants.filter((v) => v.title).map((v) => v.title).join(" / ") || "尺寸"}
            </p>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-[#1F6B72] py-3.5 text-[16px] font-semibold text-white shadow-[0_6px_12px_rgba(31,107,114,0.25)] transition disabled:opacity-50"
      >
        {saving ? "保存中..." : isEdit ? "保存修改" : "创建珠子"}
      </button>
    </form>
  );
}
