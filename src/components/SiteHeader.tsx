"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SiteHeader.module.css";

const navItems = [
  { label: "今日", href: "/" },
  { label: "归档", href: "/archive" },
  { label: "搜索", href: "/search" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.title}>每日一识</Link>
      <nav className={styles.nav}>
        {navItems.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.navItem} ${pathname === href ? styles.active : ""}`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
