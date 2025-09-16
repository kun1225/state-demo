import Link from "next/link";

export default async function Home() {
  return (
    <nav className="flex flex-col p-12 gap-4 *:underline">
      <Link href="/users">Users</Link>
      <Link href="/users-suspense">Users Suspense</Link>
    </nav>
  );
}
