import { NextRequest, NextResponse } from "next/server";
import { withMockLatency } from "@/lib/mock-delay";
import type { User, UserRole } from "@/types";
import { db } from "../_data/mock-data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") ?? "";
    const role = (searchParams.get("role") ?? "") as UserRole | "";
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 5);
    const sortKey = (searchParams.get("sortKey") ?? "createdAt") as keyof User;
    const sortDir = (searchParams.get("sortDir") ?? "desc") as "asc" | "desc";

    const result = await withMockLatency(() => {
      let filtered = db.users.filter((u) => {
        const matchSearch =
          !search ||
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = !role || u.role === role;
        return matchSearch && matchRole;
      });

      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortKey] as string;
        const bVal = b[sortKey] as string;
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });

      return {
        items: filtered.slice((page - 1) * pageSize, page * pageSize),
        total: filtered.length,
        page,
        pageSize,
      };
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const newUser = await withMockLatency(() => {
      const user: User = {
        ...payload,
        id: `u${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      db.users = [...db.users, user];
      return { ...user };
    });
    return NextResponse.json(newUser, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
