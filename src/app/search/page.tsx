import type { Metadata } from "next";
import { buildSearchIndex, getBeijingDateStr } from "@/lib/posts";
import Masthead from "@/components/Masthead";
import IssueBar from "@/components/IssueBar";
import SearchBar from "@/components/SearchBar";
import SiteFooter from "@/components/SiteFooter";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "搜索 — 每日一识",
};

export default function SearchPage() {
  const index = buildSearchIndex();
  const today = getBeijingDateStr().replace(/-/g, ".");

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <Masthead />
        <IssueBar left="SEARCH" date={today} />
        <SearchBar index={index} />
        <SiteFooter />
      </div>
    </main>
  );
}
