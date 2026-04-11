import { shopifyStorefrontFetch } from "@/lib/shopify/client";
import type { CartAttribute, CartLineInput } from "@/lib/shopify/types";

interface CartCreateResponse {
  cartCreate: {
    cart: {
      id: string;
      checkoutUrl: string;
    } | null;
    userErrors: Array<{
      field: string[] | null;
      message: string;
    }>;
  };
}

const CREATE_CART_MUTATION = `
  mutation CreateCart($lines: [CartLineInput!]!, $attributes: [AttributeInput!]) {
    cartCreate(input: { lines: $lines, attributes: $attributes }) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function createShopifyCart(
  lines: CartLineInput[],
  attributes: CartAttribute[],
): Promise<string> {
  const data = await shopifyStorefrontFetch<CartCreateResponse>({
    query: CREATE_CART_MUTATION,
    variables: {
      lines,
      attributes,
    },
  });

  const { cartCreate } = data;

  if (cartCreate.userErrors.length > 0) {
    throw new Error(cartCreate.userErrors[0].message);
  }

  if (!cartCreate.cart?.checkoutUrl) {
    throw new Error("Shopify did not return checkout URL");
  }

  return cartCreate.cart.checkoutUrl;
}
