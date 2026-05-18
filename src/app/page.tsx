import Link from "next/link";
import { Button } from "@/components/ui/button";

const sections = [
  {
    title: "0 · Theme Toggle",
    description: "單一全局 state + 2 API",
    pages: [
      { label: "Context", href: "/0-theme/context" },
      { label: "Zustand", href: "/0-theme/zustand" },
      { label: "Jotai", href: "/0-theme/jotai" },
      { label: "RTK", href: "/0-theme/rtk" },
    ],
  },
  {
    title: "1 · User",
    description: "語法基線：全局 user + preferences",
    pages: [
      { label: "Context", href: "/1-user/context" },
      { label: "Zustand", href: "/1-user/zustand" },
      { label: "Jotai", href: "/1-user/jotai" },
      { label: "RTK", href: "/1-user/rtk" },
    ],
  },
  {
    title: "2 · Async",
    description: "Async + loading / error / retry",
    pages: [
      { label: "RTK", href: "/2-async/rtk" },
      { label: "Zustand", href: "/2-async/zustand" },
      { label: "Jotai", href: "/2-async/jotai" },
    ],
  },
  {
    title: "3 · Re-render",
    description: "細粒度 re-render：大表單 + render counter",
    pages: [
      { label: "RTK", href: "/3-rerender/rtk" },
      { label: "Zustand", href: "/3-rerender/zustand" },
      { label: "Jotai", href: "/3-rerender/jotai" },
    ],
  },
  {
    title: "4 · Derived",
    description: "Derived state 鏈：filter → sort → stats",
    pages: [
      { label: "RTK", href: "/4-derived/rtk" },
      { label: "Zustand", href: "/4-derived/zustand" },
      { label: "Jotai", href: "/4-derived/jotai" },
    ],
  },
  {
    title: "5 · Cross-slice",
    description: "跨 slice 依賴：user 變動觸發 todos fetch",
    pages: [
      { label: "RTK", href: "/5-cross-slice/rtk" },
      { label: "Zustand", href: "/5-cross-slice/zustand" },
      { label: "Jotai", href: "/5-cross-slice/jotai" },
    ],
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold mb-1">RTK vs Zustand vs Jotai</h1>
      <p className="text-sm text-gray-500 mb-10">State management 深度比較</p>

      <div className="flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.title}>
            <div className="mb-3">
              <h2 className="font-semibold">{section.title}</h2>
              <p className="text-xs text-gray-400">{section.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {section.pages.map((page) => (
                <Link key={page.href} href={page.href}>
                  <Button variant="outline" size="sm">{page.label}</Button>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
