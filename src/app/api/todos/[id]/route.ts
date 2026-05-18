import { NextRequest, NextResponse } from "next/server";
import { withMockLatency } from "@/lib/mock-delay";
import { db } from "../../_data/mock-data";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const updated = await withMockLatency(() => {
      const idx = db.todos.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error(`Todo ${id} not found`);
      const todo = { ...db.todos[idx], done: !db.todos[idx].done };
      db.todos = [...db.todos.slice(0, idx), todo, ...db.todos.slice(idx + 1)];
      return { ...todo };
    });
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
