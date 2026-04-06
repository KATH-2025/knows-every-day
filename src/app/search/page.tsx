import Link from "next/link";
import type { Metadata } from "next";
import { buildSearchIndex } from "@/lib/posts";
import SearchBar from "@/components/SearchBar";
import SiteFooter from "@/components/SiteFooter";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "搜索 — 每日一识",
};

export default function SearchPage() {
  const index = buildSearchIndex();

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.pageNav}>
          <Link href="/" className={styles.backLink}>← BACK</Link>
          <span className={styles.pageTitle}>SEARCH</span>
        </div>
        <SearchBar index={index} />
        <SiteFooter />
      </div>
    </main>
  );
}
