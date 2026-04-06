import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <span className={styles.siteTitle}>Knows Everyday</span>
      <span className={styles.motto}>日日新，又日新</span>
    </footer>
  );
}
