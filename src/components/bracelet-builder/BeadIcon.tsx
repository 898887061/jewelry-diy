import type { BeadOption } from "@/lib/shopify/types";

interface BeadIconProps {
  bead: Pick<BeadOption, "colorHex" | "name" | "imageUrl">;
  size?: number;
}

export function BeadIcon({ bead, size = 68 }: BeadIconProps) {
  const hasImage = Boolean(bead.imageUrl);

  return (
    <div
      className="relative rounded-full border border-white/70 shadow-[0_10px_20px_rgba(35,39,47,0.18)]"
      style={{
        width: size,
        height: size,
        background: hasImage
          ? `url(${bead.imageUrl}) center / cover no-repeat`
          : `radial-gradient(circle at 32% 28%, #ffffff 0%, ${bead.colorHex} 45%, color-mix(in srgb, ${bead.colorHex} 75%, #7f8899) 100%)`,
      }}
      aria-hidden
    >
      <div
        className="absolute inset-x-[15%] top-[48%] h-[6%] rounded-full bg-white/70 blur-[0.4px]"
        style={{ transform: "translateY(-50%) rotate(-8deg)" }}
      />
      <div className="absolute left-[26%] top-[22%] h-[15%] w-[15%] rounded-full bg-white/65 blur-[0.6px]" />
      <span className="sr-only">{bead.name}</span>
    </div>
  );
}
