import Link from "next/link";
import styles from "./PostNav.module.css";

interface Props {
  issueNum: string;   // "002"
  date: string;       // "2026.04.06"
  prev: string | null;
  next: string | null;
}

export default function PostNav({ issueNum, date, prev, next }: Props) {
  return (
    <nav className={styles.nav}>

      {/* 左：翻篇（明确标注是"篇"，和内容内导航区分） */}
      <div className={styles.left}>
        <Link
          href={prev ? `/${prev}` : "#"}
          className={`${styles.flipBtn} ${!prev ? styles.disabled : ""}`}
          aria-disabled={!prev}
        >
          ← PREV
        </Link>
        <Link
          href={next ? `/${next}` : "#"}
          className={`${styles.flipBtn} ${!next ? styles.disabled : ""}`}
          aria-disabled={!next}
        >
          NEXT →
        </Link>
      </div>

      {/* 中：期号 + 日期 */}
      <div className={styles.center}>
        <span className={styles.issue}>NO.{issueNum} · {date}</span>
      </div>

      {/* 右：ALL ISSUES + SEARCH 入口 */}
      <div className={styles.right}>
        <Link href="/archive" className={styles.entryBtn}>ALL</Link>
        <Link href="/search" className={styles.entryBtn}>SEARCH</Link>
      </div>

    </nav>
  );
}
