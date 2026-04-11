import type { SelectedBead } from "@/lib/shopify/types";

export interface PositionedBead extends SelectedBead {
  x: number;
  y: number;
  angle: number;
}

export interface Point {
  x: number;
  y: number;
}

export function getBraceletPositions(
  beads: SelectedBead[],
  cx: number,
  cy: number,
  radius: number,
): PositionedBead[] {
  return beads.map((bead, index) => {
    const angle = (index / Math.max(beads.length, 1)) * 2 * Math.PI - Math.PI / 2;

    return {
      ...bead,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      angle,
    };
  });
}

export function getEmptySlots(
  selectedCount: number,
  maxBeads: number,
  cx: number,
  cy: number,
  radius: number,
): Point[] {
  return Array.from({ length: Math.max(0, maxBeads - selectedCount) }, (_, i) => {
    const angle = ((selectedCount + i) / maxBeads) * 2 * Math.PI - Math.PI / 2;

    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}
