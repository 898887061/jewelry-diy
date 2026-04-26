"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { SelectedBead } from "@/lib/shopify/types";
import { formatCny } from "@/lib/utils/price";
import { getBraceletPositions } from "@/lib/utils/bracelet";

interface OrderPreviewProps {
  beads: SelectedBead[];
  wristSizeCm: string;
  totalPrice: number;
  isLoading: boolean;
  onCheckout: () => void;
  onClose: () => void;
}

interface BeadGroup {
  name: string;
  sizeMm: number;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

function MiniPreviewBracelet({ beads }: { beads: SelectedBead[] }) {
  const cx = 90;
  const cy = 90;
  const radius = 62;
  const positions = getBraceletPositions(beads, cx, cy, radius);

  return (
    <svg viewBox="0 0 180 180" className="mx-auto h-[180px] w-[180px]">
      <defs>
        {beads.map((bead) => (
          <radialGradient
            key={`prev-grad-${bead.instanceId}`}
            id={`prev-grad-${bead.instanceId}`}
            cx="35%"
            cy="30%"
            r="65%"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="35%" stopColor={bead.colorHex} stopOpacity="0.8" />
            <stop offset="70%" stopColor={bead.colorHex} />
            <stop offset="100%" stopColor={`color-mix(in srgb, ${bead.colorHex} 60%, #3a3f4a)`} />
          </radialGradient>
        ))}
      </defs>
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#E0E3E9" strokeWidth="3" opacity="0.5" />
      {positions.map((bead) => {
        const r = Math.max(5, Math.min(10, bead.sizeMm * 0.8));
        return (
          <g key={bead.instanceId}>
            <circle cx={bead.x + 0.8} cy={bead.y + 1.2} r={r} fill="rgba(63,67,74,0.12)" />
            <circle cx={bead.x} cy={bead.y} r={r} fill={`url(#prev-grad-${bead.instanceId})`} />
            <ellipse
              cx={bead.x - r * 0.2}
              cy={bead.y - r * 0.25}
              rx={r * 0.3}
              ry={r * 0.25}
              fill="rgba(255,255,255,0.6)"
            />
          </g>
        );
      })}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-[#C0C4CC] text-[11px] tracking-[0.12em]"
        style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
      >
        lilpeb
      </text>
    </svg>
  );
}

export function OrderPreview({
  beads,
  wristSizeCm,
  totalPrice,
  isLoading,
  onCheckout,
  onClose,
}: OrderPreviewProps) {
  const t = useTranslations("orderPreview");

  const groups = useMemo(() => {
    const map = new Map<string, BeadGroup>();
    for (const bead of beads) {
      const key = `${bead.name}-${bead.sizeMm}`;
      const existing = map.get(key);
      if (existing) {
        existing.quantity += 1;
        existing.subtotal += bead.price;
      } else {
        map.set(key, {
          name: bead.name,
          sizeMm: bead.sizeMm,
          unitPrice: bead.price,
          quantity: 1,
          subtotal: bead.price,
        });
      }
    }
    return Array.from(map.values());
  }, [beads]);

  const notes = [
    { label: t("noteWrist"), tag: t("wristSize") },
    { label: t("noteTime"), tag: "制作时长" },
    { label: t("noteConfirm"), tag: "实拍确认" },
    { label: t("noteReturn"), tag: "换退商品" },
    { label: t("noteShipping"), tag: "邮寄运费" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/40" onClick={onClose}>
      <div className="flex-1" />
      <div
        className="mx-auto w-full max-w-[470px] overflow-hidden rounded-t-[24px] bg-white"
        style={{ animation: "slideUp 0.3s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[85dvh] overflow-y-auto pb-6">
          {/* Header close */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#F0F1F4] bg-white px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              className="text-[18px] text-[#8B92A0]"
            >
              ←
            </button>
            <h2 className="text-[16px] font-semibold text-[#1F2430]">{t("title")}</h2>
            <div className="w-6" />
          </div>

          {/* Bracelet preview */}
          <div className="bg-[#FAFBFC] py-4">
            <MiniPreviewBracelet beads={beads} />
          </div>

          {/* Wrist size */}
          <div className="flex items-center gap-3 px-5 py-4">
            <span className="text-[14px] font-semibold text-[#1F2430]">{t("wristSize")}</span>
            <span className="rounded-md border border-[#D42D34] px-3 py-1 text-[14px] font-semibold text-[#D42D34]">
              {wristSizeCm}
            </span>
            <span className="ml-auto rounded-md border border-[#E2E5EB] px-2.5 py-1 text-[12px] text-[#6F7785]">
              {t("checkWrist")}
            </span>
          </div>

          <p className="px-5 pb-3 text-[11px] text-[#9EA5B2]">{t("wristSizeUnit")}</p>

          {/* Material detail table */}
          <div className="mx-5 rounded-xl border border-[#E8EAEF]">
            <div className="border-b border-[#E8EAEF] px-4 py-2.5">
              <span className="text-[14px] font-semibold text-[#1F2430]">{t("materialDetail")}</span>
            </div>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[#F0F1F4] text-[#8B92A0]">
                  <th className="px-3 py-2 text-left font-medium">{t("colMaterial")}</th>
                  <th className="px-2 py-2 text-center font-medium">{t("colUnitPrice")}</th>
                  <th className="px-2 py-2 text-center font-medium">{t("colSize")}</th>
                  <th className="px-2 py-2 text-center font-medium">{t("colQty")}</th>
                  <th className="px-3 py-2 text-right font-medium">{t("colSubtotal")}</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={`${group.name}-${group.sizeMm}`} className="border-b border-[#F5F6F8] last:border-0">
                    <td className="px-3 py-2 text-[#3A4050]">{group.name}</td>
                    <td className="px-2 py-2 text-center text-[#6A707E]">{group.unitPrice}</td>
                    <td className="px-2 py-2 text-center text-[#6A707E]">{group.sizeMm}</td>
                    <td className="px-2 py-2 text-center text-[#6A707E]">{group.quantity}</td>
                    <td className="px-3 py-2 text-right text-[#3A4050]">{group.subtotal.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cost summary */}
          <div className="mx-5 mt-4 rounded-xl border border-[#E8EAEF] px-4 py-3">
            <h3 className="mb-2 text-[14px] font-semibold text-[#1F2430]">{t("costSummary")}</h3>
            <div className="flex items-center justify-between py-1 text-[13px]">
              <span className="text-[#6A707E]">{t("subtotal")}</span>
              <span className="text-[#3A4050]">{totalPrice.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between py-1 text-[13px]">
              <span className="text-[#6A707E]">{t("shipping")}</span>
              <span className="text-[#3A4050]">{t("freeShipping")}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-[#E8EAEF] pt-2 text-[15px] font-semibold">
              <span className="text-[#1F2430]">{t("total")}</span>
              <span className="text-[#D42D34]">{formatCny(totalPrice)}</span>
            </div>
          </div>

          {/* Purchase notes */}
          <div className="mx-5 mt-4 rounded-xl border border-[#FDE8E8] bg-[#FFFBFB] px-4 py-3">
            <h3 className="mb-2 text-center text-[14px] font-semibold text-[#D42D34]">{t("purchaseNotes")}</h3>
            <div className="space-y-2">
              {notes.map((note, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px]">
                  <span className="mt-0.5 shrink-0 rounded bg-[#FDEAEA] px-1.5 py-0.5 text-[10px] font-semibold text-[#D42D34]">
                    {note.tag}
                  </span>
                  <span className="text-[#6B4446] leading-relaxed">{note.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout button */}
          <div className="mt-5 px-5">
            <button
              type="button"
              onClick={onCheckout}
              disabled={isLoading}
              className="w-full rounded-full bg-[#D42D34] py-3.5 text-[16px] font-semibold text-white shadow-[0_6px_16px_rgba(212,45,52,0.3)] transition active:scale-[0.98] disabled:opacity-60"
            >
              {isLoading ? t("redirecting") : `${formatCny(totalPrice)} ${t("checkoutBtn")}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
