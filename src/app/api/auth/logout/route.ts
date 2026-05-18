import { NextResponse } from "next/server";
import { withMockLatency } from "@/lib/mock-delay";
import { db, INITIAL_USER, INITIAL_PREFERENCES } from "../../_data/mock-data";

export async function POST() {
  try {
    await withMockLatency(() => {
      db.user = { ...INITIAL_USER };
      db.preferences = { ...INITIAL_PREFERENCES };
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
