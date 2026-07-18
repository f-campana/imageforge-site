"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DOC_CATALOG } from "@/lib/docs/catalog";

export function DocsNav() {
  const pathname = usePathname();

  const linkClass = (active: boolean) =>
    `ui-interact-link ui-focus-ring block rounded-md px-3 py-2 text-sm ${
      active
        ? "bg-emerald-400/10 font-semibold text-emerald-200"
        : "text-zinc-300 hover:bg-white/5 hover:text-emerald-200"
    }`;

  return (
    <nav aria-label="Documentation" className="space-y-1">
      <Link
        href="/docs"
        aria-current={pathname === "/docs" ? "page" : undefined}
        className={linkClass(pathname === "/docs")}
      >
        Documentation home
      </Link>
      {DOC_CATALOG.map((doc) => (
        <Link
          key={doc.slug}
          href={`/docs/${doc.slug}`}
          aria-current={pathname === `/docs/${doc.slug}` ? "page" : undefined}
          className={linkClass(pathname === `/docs/${doc.slug}`)}
        >
          {doc.label}
        </Link>
      ))}
    </nav>
  );
}
