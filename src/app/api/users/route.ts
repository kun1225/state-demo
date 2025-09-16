import { NextResponse } from "next/server";

type Gender = "male" | "female" | "non-binary" | "other";

interface User {
  id: number;
  name: string;
  email: string;
  gender: Gender;
  title: string;
}

const firstNames = [
  "Alex",
  "Taylor",
  "Jordan",
  "Casey",
  "Riley",
  "Morgan",
  "Avery",
  "Quinn",
  "Hayden",
  "Rowan",
  "Charlie",
  "Parker",
  "Emerson",
  "River",
  "Sawyer",
  "Dakota",
  "Reese",
  "Elliot",
  "Finley",
  "Harper",
  "Logan",
  "Mason",
  "Noah",
  "Olivia",
  "Sophia",
  "Isabella",
  "Mia",
  "Amelia",
  "James",
  "Benjamin",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
];

const domains = [
  "example.com",
  "mail.com",
  "demo.io",
  "test.dev",
  "sample.org",
];

const titles = [
  "Software Engineer",
  "Product Manager",
  "Designer",
  "Data Analyst",
  "DevOps Engineer",
  "QA Engineer",
  "Project Coordinator",
  "Marketing Specialist",
  "Sales Associate",
  "Customer Success Manager",
  "HR Generalist",
  "Business Analyst",
  "Technical Writer",
  "Support Engineer",
  "Research Intern",
];

const genders: Gender[] = ["male", "female", "non-binary", "other"];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "");
}

function makeName(): string {
  const first = rand(firstNames);
  const last = rand(lastNames);
  return `${first} ${last}`;
}

function makeEmail(name: string, index: number): string {
  const base = slugify(name);
  const domain = rand(domains);
  // Add index to increase uniqueness probability
  return `${base}.${index}@${domain}`;
}

function generateUsers(count: number): User[] {
  const list: User[] = [];
  for (let i = 1; i <= count; i++) {
    const name = makeName();
    list.push({
      id: i,
      name,
      email: makeEmail(name, i),
      gender: rand(genders),
      title: rand(titles),
    });
  }
  return list;
}

const users: User[] = generateUsers(100);

export async function GET(request: Request) {
  // Optional simulated latency
  await new Promise((resolve) => setTimeout(resolve, 300));

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase().trim();
  const limitParam = searchParams.get("limit");
  const cursorParam = searchParams.get("cursor");

  const limit = limitParam ? Math.max(1, Math.min(50, Number(limitParam))) : undefined;
  const cursor = cursorParam ? Number(cursorParam) : undefined;

  let filtered = q
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.title.toLowerCase().includes(q)
      )
    : users;

  // If limit or cursor provided, return cursor-based pagination
  if (typeof limit !== "undefined" || typeof cursor !== "undefined") {
    const pageSize = limit ?? 20;
    const sorted = [...filtered].sort((a, b) => a.id - b.id);
    const startIndex = cursor ? sorted.findIndex((u) => u.id === cursor) + 1 : 0;
    const items = sorted.slice(startIndex, startIndex + pageSize);
    const last = items[items.length - 1];
    const nextCursor = last && startIndex + pageSize < sorted.length ? last.id : null;
    return NextResponse.json({ items, nextCursor, total: filtered.length });
  }

  // Default: return full list
  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<User>;
    const { name, email, gender, title } = body;

    if (!name || !email || !gender || !title) {
      return NextResponse.json(
        { message: "name, email, gender, title are required" },
        { status: 400 }
      );
    }

    if (!(["male", "female", "non-binary", "other"] as const).includes(gender as any)) {
      return NextResponse.json(
        { message: "invalid gender" },
        { status: 400 }
      );
    }

    const id = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const user: User = { id, name, email, gender: gender as Gender, title };
    users.push(user);

    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: "invalid json" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");
  const id = idParam ? Number(idParam) : NaN;

  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ message: "id is required" }, { status: 400 });
  }

  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    return NextResponse.json({ message: "not found" }, { status: 404 });
  }

  const [removed] = users.splice(idx, 1);
  return NextResponse.json({ ok: true, removed });
}
