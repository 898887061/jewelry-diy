import { NextResponse } from "next/server";
import { shopifyAdminFetch } from "@/lib/shopify/admin-client";
import { ADMIN_GET_BEADS } from "@/lib/shopify/admin/queries";
import { ADMIN_CREATE_PRODUCT } from "@/lib/shopify/admin/mutations";
import type {
  AdminBeadInput,
  AdminProductCreateResponse,
  AdminProductsResponse,
} from "@/lib/shopify/admin/types";
import { verifyAdminRequest } from "@/lib/admin/session";
import {
  isShopifyAdminConfigured,
  mockAdminGetBeads,
  mockAdminCreateBead,
} from "@/lib/mock/admin-beads";

export async function GET(request: Request) {
  const authError = await verifyAdminRequest(request);
  if (authError) return authError;

  // Mock fallback when Shopify Admin API is not configured
  if (!isShopifyAdminConfigured()) {
    return NextResponse.json({ beads: mockAdminGetBeads() });
  }

  try {
    const data = await shopifyAdminFetch<AdminProductsResponse>({
      query: ADMIN_GET_BEADS,
      variables: { first: 100 },
    });

    const beads = data.products.edges.map(({ node }) => {
      const metafields: Record<string, string> = {};
      for (const edge of node.metafields.edges) {
        metafields[`${edge.node.namespace}.${edge.node.key}`] = edge.node.value;
      }

      return {
        id: node.id,
        title: node.title,
        handle: node.handle,
        status: node.status,
        imageUrl: node.featuredImage?.url ?? "",
        colorHex: metafields["bead.color_hex"] ?? "#CCCCCC",
        category: metafields["bead.category"] ?? "其他",
        textureUrl: metafields["bead.texture_url"] ?? "",
        variants: node.variants.edges.map(({ node: v }) => ({
          id: v.id,
          title: v.title,
          price: v.price,
          inventoryQuantity: v.inventoryQuantity,
        })),
      };
    });

    return NextResponse.json({ beads });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await verifyAdminRequest(request);
  if (authError) return authError;

  try {
    const body = (await request.json()) as AdminBeadInput;

    // Mock fallback
    if (!isShopifyAdminConfigured()) {
      const created = mockAdminCreateBead({
        title: body.title,
        category: body.category,
        colorHex: body.colorHex,
        textureUrl: body.textureUrl,
        variants: body.variants,
      });
      return NextResponse.json(
        { product: { id: created.id, handle: created.handle } },
        { status: 201 },
      );
    }

    const variants = body.variants.map((v) => ({
      title: v.title,
      price: v.price,
    }));

    const metafields = [
      {
        namespace: "bead",
        key: "color_hex",
        value: body.colorHex,
        type: "single_line_text_field",
      },
      {
        namespace: "bead",
        key: "category",
        value: body.category,
        type: "single_line_text_field",
      },
    ];

    if (body.textureUrl) {
      metafields.push({
        namespace: "bead",
        key: "texture_url",
        value: body.textureUrl,
        type: "url",
      });
    }

    const input = {
      title: body.title,
      productType: "Bead",
      tags: ["bracelet-bead"],
      variants,
      metafields,
    };

    const data = await shopifyAdminFetch<AdminProductCreateResponse>({
      query: ADMIN_CREATE_PRODUCT,
      variables: { input },
    });

    if (data.productCreate.userErrors.length > 0) {
      return NextResponse.json(
        { errors: data.productCreate.userErrors },
        { status: 422 },
      );
    }

    return NextResponse.json({ product: data.productCreate.product }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
