import Link from "next/link";
import styles from "./NavArrows.module.css";

interface NavArrowsProps {
  prev: string | null;  // 更早的 slug
  next: string | null;  // 更新的 slug
  current: number;      // 当前是第几篇（从1起）
  total: number;
}

export default function NavArrows({ prev, next, current, total }: NavArrowsProps) {
  return (
    <div className={styles.wrap}>
      {prev ? (
        <Link href={`/${prev}`} className={styles.btn}>← 前一天</Link>
      ) : (
        <span className={`${styles.btn} ${styles.disabled}`}>← 前一天</span>
      )}
      <span className={styles.info}>第 {current} / {total} 篇</span>
      {next ? (
        <Link href={`/${next}`} className={styles.btn}>后一天 →</Link>
      ) : (
        <span className={`${styles.btn} ${styles.disabled}`}>后一天 →</span>
      )}
    </div>
  );
}
