import { mockBeads } from "@/lib/mock/beads";
import { getBeadsFromShopify } from "@/lib/shopify/queries/beads";
import type { Bead } from "@/lib/shopify/types";

export async function loadBeads(): Promise<Bead[]> {
  try {
    const beads = await getBeadsFromShopify();
    if (beads.length > 0) {
      return beads;
    }

    return mockBeads;
  } catch {
    return mockBeads;
  }
}
