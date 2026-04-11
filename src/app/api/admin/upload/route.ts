import { NextResponse } from "next/server";
import { shopifyAdminFetch } from "@/lib/shopify/admin-client";
import { ADMIN_STAGED_UPLOAD_CREATE } from "@/lib/shopify/admin/mutations";
import type { StagedUploadResponse } from "@/lib/shopify/admin/types";
import { verifyAdminRequest } from "@/lib/admin/session";

export async function POST(request: Request) {
  const authError = await verifyAdminRequest(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Step 1: Create staged upload target
    const data = await shopifyAdminFetch<StagedUploadResponse>({
      query: ADMIN_STAGED_UPLOAD_CREATE,
      variables: {
        input: [
          {
            filename: file.name,
            mimeType: file.type,
            resource: "IMAGE",
            fileSize: String(file.size),
            httpMethod: "POST",
          },
        ],
      },
    });

    if (data.stagedUploadsCreate.userErrors.length > 0) {
      return NextResponse.json(
        { errors: data.stagedUploadsCreate.userErrors },
        { status: 422 },
      );
    }

    const target = data.stagedUploadsCreate.stagedTargets[0];
    if (!target) {
      return NextResponse.json({ error: "No upload target returned" }, { status: 500 });
    }

    // Step 2: Upload file to staged URL
    const uploadForm = new FormData();
    for (const param of target.parameters) {
      uploadForm.append(param.name, param.value);
    }
    uploadForm.append("file", file);

    const uploadResponse = await fetch(target.url, {
      method: "POST",
      body: uploadForm,
    });

    if (!uploadResponse.ok) {
      return NextResponse.json(
        { error: `Upload failed with status ${uploadResponse.status}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      resourceUrl: target.resourceUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
