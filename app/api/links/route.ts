// app/api/links/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createLinkSchema } from "@/lib/validation";
import { generateCode } from "@/lib/generateCode";
import { createLink, getLinkByCode, listLinks } from "@/lib/linkService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = createLinkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { targetUrl, code: rawCode } = parsed.data;

    // If no custom code, generate one
    let code = rawCode ?? generateCode(6);

    // Ensure unique code (check DB)
    let existing = await getLinkByCode(code);
    if (existing) {
      // If user provided custom code, we must return 409
      if (rawCode) {
        return NextResponse.json(
          { error: "Code already exists." },
          { status: 409 }
        );
      }

      // If it was auto-generated, try a few more times
      let attempts = 0;
      while (existing && attempts < 5) {
        code = generateCode(6);
        existing = await getLinkByCode(code);
        attempts++;
      }

      if (existing) {
        return NextResponse.json(
          { error: "Could not generate unique code. Try again." },
          { status: 500 }
        );
      }
    }

    const link = await createLink({ code, targetUrl });

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
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error in POST /api/links:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const links = await listLinks();
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    const data = links.map((link) => ({
      code: link.code,
      targetUrl: link.targetUrl,
      shortUrl: `${baseUrl}/${link.code}`,
      clicks: link.clicks,
      lastClicked: link.lastClicked,
      createdAt: link.createdAt,
    }));

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Error in GET /api/links:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
