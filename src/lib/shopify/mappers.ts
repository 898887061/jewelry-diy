import type { Bead, BeadCategory, ShopifyProductNode } from "@/lib/shopify/types";

function normalizeCategory(value?: string | null): BeadCategory {
  if (!value) return "其他";

  const raw = value.trim();
  const known = ["白水晶", "紫水晶", "黄水晶", "粉水晶", "黑曜石"] as const;

  return known.includes(raw as (typeof known)[number]) ? (raw as BeadCategory) : "其他";
}

function parseSizeMm(title: string): number {
  const matched = title.match(/(\d+(?:\.\d+)?)\s*mm/i);
  if (!matched) return 8;

  return Number(matched[1]);
}

function parseHex(value?: string | null): `#${string}` {
  if (!value) return "#D8D8D8";
  return value.startsWith("#") ? (value as `#${string}`) : (`#${value}` as `#${string}`);
}

export function mapShopifyProductToBead(node: ShopifyProductNode): Bead {
  const variants = node.variants.edges.map(({ node: variantNode }) => ({
    id: variantNode.id,
    title: variantNode.title,
    sizeMm: parseSizeMm(variantNode.title),
    price: Number(variantNode.price.amount),
    currencyCode: variantNode.price.currencyCode,
    availableForSale: variantNode.availableForSale,
  }));

  return {
    id: node.id,
    handle: node.handle,
    name: node.title,
    category: normalizeCategory(node.category?.value),
    colorHex: parseHex(node.colorHex?.value),
    imageUrl: node.images.edges[0]?.node.url ?? "/beads/fallback.png",
    textureUrl: node.textureUrl?.value ?? undefined,
    variants,
  };
}
