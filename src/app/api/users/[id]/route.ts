import { NextRequest, NextResponse } from "next/server";
import { withMockLatency } from "@/lib/mock-delay";
import { db } from "../../_data/mock-data";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await withMockLatency(() => {
      const found = db.users.find((u) => u.id === id);
      if (!found) throw new Error(`User ${id} not found`);
      return { ...found };
    });
    return NextResponse.json(user);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const patch = await req.json();
    const updated = await withMockLatency(() => {
      const idx = db.users.findIndex((u) => u.id === id);
      if (idx === -1) throw new Error(`User ${id} not found`);
      const user = { ...db.users[idx], ...patch };
      db.users = [...db.users.slice(0, idx), user, ...db.users.slice(idx + 1)];
      return { ...user };
    });
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await withMockLatency(() => {
      db.users = db.users.filter((u) => u.id !== id);
    });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
