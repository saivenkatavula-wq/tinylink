// app/healthz/route.ts
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    { ok: true, version: "1.0" },
    { status: 200 }
  );
}
