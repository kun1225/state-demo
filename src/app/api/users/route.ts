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

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("users", users);

  return NextResponse.json(users);
}
