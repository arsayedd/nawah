import { NextResponse } from "next/server";
import { resetOs } from "@/lib/os/repo";
import type { Locale } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { locale?: Locale };
    const data = await resetOs(body.locale ?? "en");
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reset";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
