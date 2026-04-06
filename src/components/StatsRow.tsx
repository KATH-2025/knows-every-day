import type { SiteStats } from "@/types";
import styles from "./StatsRow.module.css";

export default function StatsRow({ stats }: { stats: SiteStats }) {
  return (
    <div className={styles.row}>
      <div className={styles.chip}>
        <div className={styles.num}>{stats.total}</div>
        <div className={styles.label}>已积累天数</div>
      </div>
      <div className={styles.chip}>
        <div className={styles.num}>{stats.topicCount}</div>
        <div className={styles.label}>涉及领域</div>
      </div>
      <div className={styles.chip}>
        <div className={styles.num}>连续 {stats.streak} 天</div>
        <div className={styles.label}>当前连更</div>
      </div>
    </div>
  );
}
