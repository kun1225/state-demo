import { NextRequest, NextResponse } from "next/server";
import { withMockLatency } from "@/lib/mock-delay";
import { db } from "../../_data/mock-data";

export async function GET() {
  try {
    const prefs = await withMockLatency(() => ({ ...db.preferences }));
    return NextResponse.json(prefs);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const patch = await req.json();
    const updated = await withMockLatency(() => {
      db.preferences = { ...db.preferences, ...patch };
      return { ...db.preferences };
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
