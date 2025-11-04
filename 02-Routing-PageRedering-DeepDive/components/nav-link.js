"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

export default function NavLink({ href, children }) {
  const pathname = usePathname();

  return (
    <li>
      <Link
        href={href}
        className={pathname.startsWith(href) ? "active" : undefined}
      >
        {children}
      </Link>
    </li>
  );
}
