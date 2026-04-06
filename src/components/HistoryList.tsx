import Link from "next/link";
import type { PostMeta } from "@/types";
import styles from "./HistoryList.module.css";

interface Props {
  posts: PostMeta[];
  limit?: number;
}

export default function HistoryList({ posts, limit }: Props) {
  const items = limit ? posts.slice(0, limit) : posts;

  if (items.length === 0) {
    return <p className={styles.empty}>暂无历史内容</p>;
  }

  return (
    <div className={styles.list}>
      {items.map((post) => {
        const mmdd = post.date.slice(5).replace("-", ".");
        return (
          <Link key={post.slug} href={`/${post.slug}`} className={styles.item}>
            <span className={styles.date}>{mmdd}</span>
            <span className={styles.title}>{post.title}</span>
            <span className={styles.topic}>{post.topic}</span>
          </Link>
        );
      })}
    </div>
  );
}
