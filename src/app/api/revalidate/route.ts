import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    path?: string;
    secret?: string;
  };

  const expectedSecret = process.env.REVALIDATE_SECRET;
  if (expectedSecret && body.secret !== expectedSecret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const path = body.path ?? "/builder";
  revalidatePath(path);

  return NextResponse.json({ revalidated: true, path });
}
