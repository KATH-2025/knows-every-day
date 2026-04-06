import Link from "next/link";
import styles from "./Masthead.module.css";

export default function Masthead() {
  return (
    <header className={styles.masthead}>
      <nav className={styles.preNav}>
        <Link href="/" className={styles.navLink}>TODAY</Link>
        <Link href="/archive" className={styles.navLink}>ARCHIVE</Link>
        <Link href="/search" className={styles.navLink}>SEARCH</Link>
      </nav>

      <div className={styles.rule2px} />

      <div className={styles.inner}>
        <Link href="/" className={styles.title}>KNOWS EVERYDAY</Link>
        <div className={styles.subtitle}>每日一识</div>
      </div>

      <div className={styles.ruleHalf} />
    </header>
  );
}
