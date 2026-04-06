import Link from "next/link";
import type { Metadata } from "next";
import { getAllPostsMeta } from "@/lib/posts";
import SiteFooter from "@/components/SiteFooter";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "归档 — 每日一识",
  description: "所有内容归档，按年月浏览。",
};

type YearGroup = {
  year: string;
  months: { month: string; posts: ReturnType<typeof getAllPostsMeta> }[];
};

export default function ArchivePage() {
  const allMetas = getAllPostsMeta();

  // 按年月分组
  const grouped: Record<string, Record<string, typeof allMetas>> = {};
  for (const post of allMetas) {
    const [year, month] = post.date.split("-");
    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][month]) grouped[year][month] = [];
    grouped[year][month].push(post);
  }

  const years: YearGroup[] = Object.keys(grouped)
    .sort()
    .reverse()
    .map((year) => ({
      year,
      months: Object.keys(grouped[year])
        .sort()
        .reverse()
        .map((month) => ({ month, posts: grouped[year][month] })),
    }));

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.pageNav}>
          <Link href="/" className={styles.backLink}>← BACK</Link>
          <span className={styles.pageTitle}>ARCHIVE · {allMetas.length}</span>
        </div>

        {years.length === 0 && (
          <p className={styles.empty}>NO ISSUES YET</p>
        )}

        {years.map(({ year, months }) => (
          <section key={year} className={styles.yearSection}>
            <div className={styles.yearLabel}>{year}</div>
            {months.map(({ month, posts }) => (
              <div key={month} className={styles.monthGroup}>
                <div className={styles.monthLabel}>{month}</div>
                <div className={styles.list}>
                  {posts.map((post) => {
                    const day = post.date.slice(8);
                    return (
                      <Link key={post.slug} href={`/${post.slug}`} className={styles.item}>
                        <span className={styles.day}>{day}</span>
                        <span className={styles.title}>{post.title}</span>
                        <span className={styles.topic}>{post.topic}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        ))}

        <SiteFooter />
      </div>
    </main>
  );
}
