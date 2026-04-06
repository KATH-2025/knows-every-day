import Link from "next/link";
import styles from "./PostNav.module.css";

interface Props {
  issueNum: string;
  date: string;
  prev: string | null;
  next: string | null;
}

export default function PostNav({ issueNum, date, prev, next }: Props) {
  return (
    <nav className={styles.nav}>

      {/* 第一行：PREV · ··· · NEXT */}
      <div className={styles.row1}>

        <Link
          href={prev ? `/${prev}` : "#"}
          className={`${styles.flip} ${!prev ? styles.disabled : ""}`}
          aria-disabled={!prev}
        >
          ← PREV
        </Link>

        {/* ··· 菜单，原生 details/summary，无需 JS */}
        <details className={styles.menuWrap}>
          <summary className={styles.menuBtn}>···</summary>
          <div className={styles.dropdown}>
            <Link href="/" className={styles.dropItem}>TODAY</Link>
            <Link href="/archive" className={styles.dropItem}>ALL ISSUES</Link>
            <Link href="/search" className={styles.dropItem}>SEARCH</Link>
          </div>
        </details>

        <Link
          href={next ? `/${next}` : "#"}
          className={`${styles.flip} ${!next ? styles.disabled : ""}`}
          aria-disabled={!next}
        >
          NEXT →
        </Link>

      </div>

      {/* 第二行：期号 + 日期 */}
      <div className={styles.row2}>
        <span className={styles.issue}>NO.{issueNum} · {date}</span>
      </div>

    </nav>
  );
}
