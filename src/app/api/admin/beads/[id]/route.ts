import { NextResponse } from "next/server";
import { shopifyAdminFetch } from "@/lib/shopify/admin-client";
import { ADMIN_GET_BEAD_BY_ID } from "@/lib/shopify/admin/queries";
import { ADMIN_UPDATE_PRODUCT, ADMIN_DELETE_PRODUCT } from "@/lib/shopify/admin/mutations";
import type {
  AdminBeadInput,
  AdminProductResponse,
  AdminProductUpdateResponse,
  AdminProductDeleteResponse,
} from "@/lib/shopify/admin/types";
import { verifyAdminRequest } from "@/lib/admin/session";
import {
  isShopifyAdminConfigured,
  mockAdminGetBeadById,
  mockAdminUpdateBead,
  mockAdminDeleteBead,
} from "@/lib/mock/admin-beads";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const authError = await verifyAdminRequest(request);
  if (authError) return authError;

  const { id } = await params;

  // Mock fallback
  if (!isShopifyAdminConfigured()) {
    const bead = mockAdminGetBeadById(id) ?? mockAdminGetBeadById(`mock-${id}`);
    if (!bead) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ bead });
  }

  const productId = `gid://shopify/Product/${id}`;

  try {
    const data = await shopifyAdminFetch<AdminProductResponse>({
      query: ADMIN_GET_BEAD_BY_ID,
      variables: { id: productId },
    });

    if (!data.product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const node = data.product;
    const metafields: Record<string, string> = {};
    for (const edge of node.metafields.edges) {
      metafields[`${edge.node.namespace}.${edge.node.key}`] = edge.node.value;
    }

    return NextResponse.json({
      bead: {
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
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const authError = await verifyAdminRequest(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    const body = (await request.json()) as Partial<AdminBeadInput>;

    // Mock fallback
    if (!isShopifyAdminConfigured()) {
      const updated = mockAdminUpdateBead(id, {
        title: body.title,
        category: body.category,
        colorHex: body.colorHex,
        textureUrl: body.textureUrl,
        variants: body.variants,
      });
      if (!updated) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json({ product: { id: updated.id, handle: updated.handle } });
    }

    const productId = `gid://shopify/Product/${id}`;
    const input: Record<string, unknown> = { id: productId };

    if (body.title) input.title = body.title;
    if (body.variants) {
      input.variants = body.variants.map((v) => ({
        ...(v.id ? { id: v.id } : {}),
        title: v.title,
        price: v.price,
      }));
    }

    const metafields: Array<{
      namespace: string;
      key: string;
      value: string;
      type: string;
    }> = [];

    if (body.colorHex) {
      metafields.push({
        namespace: "bead",
        key: "color_hex",
        value: body.colorHex,
        type: "single_line_text_field",
      });
    }
    if (body.category) {
      metafields.push({
        namespace: "bead",
        key: "category",
        value: body.category,
        type: "single_line_text_field",
      });
    }
    if (body.textureUrl) {
      metafields.push({
        namespace: "bead",
        key: "texture_url",
        value: body.textureUrl,
        type: "url",
      });
    }

    if (metafields.length > 0) {
      input.metafields = metafields;
    }

    const data = await shopifyAdminFetch<AdminProductUpdateResponse>({
      query: ADMIN_UPDATE_PRODUCT,
      variables: { input },
    });

    if (data.productUpdate.userErrors.length > 0) {
      return NextResponse.json(
        { errors: data.productUpdate.userErrors },
        { status: 422 },
      );
    }

    return NextResponse.json({ product: data.productUpdate.product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const authError = await verifyAdminRequest(request);
  if (authError) return authError;

  const { id } = await params;

  // Mock fallback
  if (!isShopifyAdminConfigured()) {
    const deleted = mockAdminDeleteBead(id);
    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ deleted: id });
  }

  const productId = `gid://shopify/Product/${id}`;

  try {
    const data = await shopifyAdminFetch<AdminProductDeleteResponse>({
      query: ADMIN_DELETE_PRODUCT,
      variables: { input: { id: productId } },
    });

    if (data.productDelete.userErrors.length > 0) {
      return NextResponse.json(
        { errors: data.productDelete.userErrors },
        { status: 422 },
      );
    }

    return NextResponse.json({ deleted: data.productDelete.deletedProductId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
