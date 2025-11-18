// app/api/links/[code]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getLinkByCode, deleteLink } from "@/lib/linkService";

type ParamsPromise = { params: Promise<{ code: string }> };

export async function GET(
  _req: NextRequest,
  { params }: ParamsPromise
) {
  const { code } = await params;

  const link = await getLinkByCode(code);
  if (!link) {
    return NextResponse.json(
      { error: "Link not found" },
      { status: 404 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  return NextResponse.json(
    {
      code: link.code,
      targetUrl: link.targetUrl,
      shortUrl: `${baseUrl}/${link.code}`,
      clicks: link.clicks,
      lastClicked: link.lastClicked,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    },
    { status: 200 }
  );
}

export async function DELETE(
  _req: NextRequest,
  { params }: ParamsPromise
) {
  const { code } = await params;

  const link = await getLinkByCode(code);
  if (!link) {
    return NextResponse.json(
      { error: "Link not found" },
      { status: 404 }
    );
  }

  await deleteLink(code);

  return NextResponse.json(
    { ok: true, message: "Link deleted" },
    { status: 200 }
  );
}
