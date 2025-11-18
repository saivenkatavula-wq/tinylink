// app/[code]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getLinkByCode, incrementClicks } from "@/lib/linkService";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params; // 👈 IMPORTANT

  const link = await getLinkByCode(code);

  if (!link) {
    return NextResponse.json(
      { error: "Short link not found" },
      { status: 404 }
    );
  }

  await incrementClicks(code);

  return NextResponse.redirect(link.targetUrl, 302);
}
