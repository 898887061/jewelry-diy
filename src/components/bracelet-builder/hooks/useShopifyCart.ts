"use client";

import { useState } from "react";
import type { CartAttribute, CartLineInput } from "@/lib/shopify/types";

interface CheckoutPayload {
  lines: CartLineInput[];
  attributes: CartAttribute[];
}

export function useShopifyCart() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createCartAndGoCheckout(payload: CheckoutPayload): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/shopify/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { checkoutUrl?: string; error?: string };

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error ?? "创建购物车失败，请稍后再试");
      }

      window.location.href = data.checkoutUrl;
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "请求失败，请检查网络后重试";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return { createCartAndGoCheckout, isLoading, error };
}
