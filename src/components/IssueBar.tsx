import Link from "next/link";
import styles from "./IssueBar.module.css";

interface IssueBarProps {
  left: string;          // "NO.127" | "ARCHIVE" | "SEARCH"
  date: string;          // 已格式化，如 "2025.07.10"
  prev?: string | null;  // 前一篇 slug
  next?: string | null;  // 后一篇 slug
}

export default function IssueBar({ left, date, prev, next }: IssueBarProps) {
  return (
    <div className={styles.bar}>
      <span className={styles.left}>{left}</span>
      <span className={styles.center}>{date}</span>
      <span className={styles.right}>
        {prev ? (
          <Link href={`/${prev}`} className={styles.navLink}>← PREV</Link>
        ) : (
          <span className={styles.disabled}>← PREV</span>
        )}
        <span className={styles.sep}>/</span>
        {next ? (
          <Link href={`/${next}`} className={styles.navLink}>NEXT →</Link>
        ) : (
          <span className={styles.disabled}>NEXT →</span>
        )}
      </span>
    </div>
  );
}
