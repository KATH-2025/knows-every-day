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
      {/* 左：回首页 */}
      <Link href="/" className={styles.home} title="回首页">
        <span className={styles.homeLogo}>K</span>
        <span className={styles.homeLabel}>HOME</span>
      </Link>

      {/* 中：期号 + 日期 */}
      <div className={styles.center}>
        <span className={styles.no}>NO.{issueNum}</span>
        <span className={styles.dot}>·</span>
        <span className={styles.date}>{date}</span>
      </div>

      {/* 右：搜索 + 前后翻篇 */}
      <div className={styles.right}>
        <Link href="/archive" className={styles.btn} title="所有文章">
          ≡
        </Link>
        <Link
          href={prev ? `/${prev}` : "#"}
          className={`${styles.btn} ${!prev ? styles.disabled : ""}`}
          aria-disabled={!prev}
          title="上一篇"
        >
          ←
        </Link>
        <Link
          href={next ? `/${next}` : "#"}
          className={`${styles.btn} ${!next ? styles.disabled : ""}`}
          aria-disabled={!next}
          title="下一篇"
        >
          →
        </Link>
      </div>
    </nav>
  );
}
