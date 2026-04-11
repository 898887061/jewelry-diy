import { NextResponse } from "next/server";
import { createShopifyCart } from "@/lib/shopify/mutations/cartCreate";
import type { CartAttribute, CartLineInput } from "@/lib/shopify/types";

interface CreateCartBody {
  lines?: CartLineInput[];
  attributes?: CartAttribute[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateCartBody;

    if (!body.lines || body.lines.length === 0) {
      return NextResponse.json(
        { error: "购物车为空，无法结账" },
        { status: 400 },
      );
    }

    const checkoutUrl = await createShopifyCart(
      body.lines,
      body.attributes ?? [],
    );

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "创建 Shopify 购物车失败";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
