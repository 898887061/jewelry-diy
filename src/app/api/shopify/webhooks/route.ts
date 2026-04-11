import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

function verifyShopifyWebhook(rawBody: string, hmacHeader: string | null): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret || !hmacHeader) return false;

  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");

  const digestBuffer = Buffer.from(digest, "utf8");
  const hmacBuffer = Buffer.from(hmacHeader, "utf8");

  if (digestBuffer.length !== hmacBuffer.length) {
    return false;
  }

  return timingSafeEqual(digestBuffer, hmacBuffer);
}

export async function POST(request: Request) {
  const topic = request.headers.get("x-shopify-topic") ?? "unknown";
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
  const rawBody = await request.text();

  if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  switch (topic) {
    case "products/create":
    case "products/update":
    case "products/delete":
      revalidatePath("/builder");
      revalidatePath("/products");
      break;

    case "inventory_levels/update":
      revalidatePath("/builder");
      revalidatePath("/products");
      break;

    case "orders/create":
      console.log("[webhook] New order created:", topic);
      break;

    default:
      console.log("[webhook] Unhandled topic:", topic);
  }

  return NextResponse.json({ ok: true, topic });
}
