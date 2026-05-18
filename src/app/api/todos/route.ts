import { NextRequest, NextResponse } from "next/server";
import { withMockLatency } from "@/lib/mock-delay";
import { db } from "../_data/mock-data";

export async function GET(req: NextRequest) {
  try {
    const ownerId = req.nextUrl.searchParams.get("ownerId") ?? "";
    const result = await withMockLatency(() =>
      db.todos.filter((t) => !ownerId || t.ownerId === ownerId).map((t) => ({ ...t }))
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
