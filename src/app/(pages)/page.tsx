import Link from "next/link";

export default async function Home() {
  return (
    <nav className="flex flex-col p-12 gap-4 *:underline">
      <Link href="/users">Users</Link>
      <Link href="/users-suspense">Users Suspense</Link>
      <Link href="/redux">Redux</Link>
      <Link href="/redux-simple">Redux Simple</Link>
      <Link href="/zustand">Zustand</Link>
      <Link href="/jotai">Jotai</Link>
    </nav>
  );
}
