export interface AdminBeadVariant {
  id?: string;
  title: string;
  price: string;
}

export interface AdminBeadInput {
  title: string;
  category: string;
  colorHex: string;
  textureUrl?: string;
  variants: AdminBeadVariant[];
  imageUrl?: string;
}

export interface AdminProductNode {
  id: string;
  title: string;
  handle: string;
  status: "ACTIVE" | "ARCHIVED" | "DRAFT";
  tags: string[];
  featuredImage: { url: string; altText?: string | null } | null;
  metafields: {
    edges: Array<{
      node: {
        namespace: string;
        key: string;
        value: string;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: string;
        inventoryQuantity: number;
      };
    }>;
  };
}

export interface AdminProductsResponse {
  products: {
    edges: Array<{ node: AdminProductNode; cursor: string }>;
    pageInfo: { hasNextPage: boolean };
  };
}

export interface AdminProductResponse {
  product: AdminProductNode;
}

export interface AdminProductCreateResponse {
  productCreate: {
    product: { id: string; handle: string } | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

export interface AdminProductUpdateResponse {
  productUpdate: {
    product: { id: string; handle: string } | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

export interface AdminProductDeleteResponse {
  productDelete: {
    deletedProductId: string | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

export interface StagedUploadResponse {
  stagedUploadsCreate: {
    stagedTargets: Array<{
      url: string;
      resourceUrl: string;
      parameters: Array<{ name: string; value: string }>;
    }>;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}
