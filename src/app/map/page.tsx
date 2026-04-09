import Link from "next/link";
import type { Metadata } from "next";
import { getAllPostsMeta } from "@/lib/posts";
import KnowledgeMap from "@/components/KnowledgeMap";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "知识地图 — 每日一识",
};

export default function MapPage() {
  const allMetas = getAllPostsMeta();

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.pageNav}>
          <Link href="/" className={styles.backLink}>← BACK</Link>
          <span className={styles.pageTitle}>KNOWLEDGE MAP</span>
        </div>
        <p className={styles.hint}>
          点击格子前往该期 · 彩色 = 已读 · 灰色 = 未读
        </p>
        <KnowledgeMap posts={allMetas} />
      </div>
    </main>
  );
}
