export type BeadCategory =
  | "白水晶"
  | "紫水晶"
  | "黄水晶"
  | "粉水晶"
  | "黑曜石"
  | "其他";

export interface BeadVariant {
  id: string;
  title: string;
  sizeMm: number;
  price: number;
  currencyCode: string;
  availableForSale: boolean;
}

export interface Bead {
  id: string;
  handle: string;
  name: string;
  category: BeadCategory;
  colorHex: `#${string}`;
  imageUrl: string;
  textureUrl?: string;
  variants: BeadVariant[];
}

export interface BeadOption {
  optionId: string;
  beadId: string;
  variantId: string;
  name: string;
  category: BeadCategory;
  imageUrl: string;
  colorHex: `#${string}`;
  sizeMm: number;
  price: number;
  currencyCode: string;
  availableForSale: boolean;
}

export interface SelectedBead extends BeadOption {
  instanceId: string;
}

export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
}

export interface CartAttribute {
  key: string;
  value: string;
}

export interface ShopifyMoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface ShopifyProductNode {
  id: string;
  handle: string;
  title: string;
  tags: string[];
  colorHex?: { value: string | null } | null;
  category?: { value: string | null } | null;
  textureUrl?: { value: string | null } | null;
  images: {
    edges: Array<{
      node: {
        url: string;
        altText?: string | null;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        availableForSale: boolean;
        price: ShopifyMoneyV2;
      };
    }>;
  };
}
