import { mapShopifyProductToBead } from "@/lib/shopify/mappers";
import { shopifyStorefrontFetch } from "@/lib/shopify/client";
import type { Bead, ShopifyProductNode } from "@/lib/shopify/types";

interface GetBeadsResponse {
  products: {
    edges: Array<{
      node: ShopifyProductNode;
    }>;
  };
}

const GET_BEADS_QUERY = `
  query GetBeads($first: Int!) {
    products(first: $first, query: "tag:bracelet-bead") {
      edges {
        node {
          id
          handle
          title
          tags
          colorHex: metafield(namespace: "bead", key: "color_hex") {
            value
          }
          category: metafield(namespace: "bead", key: "category") {
            value
          }
          textureUrl: metafield(namespace: "bead", key: "texture_url") {
            value
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function getBeadsFromShopify(limit = 100): Promise<Bead[]> {
  const data = await shopifyStorefrontFetch<GetBeadsResponse>({
    query: GET_BEADS_QUERY,
    variables: { first: limit },
  });

  return data.products.edges.map(({ node }) => mapShopifyProductToBead(node));
}
