import { NextResponse } from "next/server";
import { pickOsState, type OsPayload } from "@/lib/os/payload";
import { osStatus, readOs, writeOs } from "@/lib/os/repo";
import type { Locale } from "@/lib/types";

export async function GET() {
  try {
    const data = await readOs();
    const status = await osStatus();
    return NextResponse.json({ ...data, status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Partial<OsPayload> & { locale?: Locale };
    if (!body.state) {
      return NextResponse.json({ error: "Missing state" }, { status: 400 });
    }
    const saved = await writeOs({
      locale: body.locale ?? "ar",
      state: pickOsState(body.state),
    });
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
