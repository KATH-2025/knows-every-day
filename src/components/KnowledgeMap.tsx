"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { PostMeta } from "@/types";
import styles from "./KnowledgeMap.module.css";

// 主题 → 颜色（与设计系统搭配）
const TOPIC_COLORS: Record<string, string> = {
  科技: "#4a7fa5",
  历史: "#b07d4a",
  艺术: "#7a5fa5",
  科学: "#4a9a6a",
  文化: "#a05a5a",
  哲学: "#5a8a8a",
  经济: "#8a7a4a",
  自然: "#5a9a5a",
};
const DEFAULT_COLOR = "#7a7a7a";

function getTopicColor(topic: string) {
  return TOPIC_COLORS[topic] ?? DEFAULT_COLOR;
}

function getUserId(): string {
  let id = localStorage.getItem("ke_user_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("ke_user_id", id);
  }
  return id;
}

interface Props {
  posts: PostMeta[];
}

export default function KnowledgeMap({ posts }: Props) {
  const [readSlugs, setReadSlugs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getUserId();
    fetch(`/api/read?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => { const d = data as { slugs?: string[] }; return d; })
      .then((data) => {
        setReadSlugs(new Set(data.slugs ?? []));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // 填充到7的倍数，从周一起头
  const cells = [...posts];
  const firstDate = cells.length > 0 ? new Date(cells[cells.length - 1].date + "T00:00:00") : new Date();
  const dayOfWeek = (firstDate.getDay() + 6) % 7; // 0=周一
  const padded: (PostMeta | null)[] = [
    ...Array(dayOfWeek).fill(null),
    ...cells.reverse(),
  ];

  // 统计
  const readCount = posts.filter((p) => readSlugs.has(p.slug)).length;
  const topics = Array.from(new Set(posts.map((p) => p.topic)));

  return (
    <div className={styles.wrap}>
      {/* 图例 */}
      <div className={styles.legend}>
        {topics.map((t) => (
          <span key={t} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ background: getTopicColor(t) }}
            />
            {t}
          </span>
        ))}
      </div>

      {/* 网格 */}
      <div className={styles.grid}>
        {padded.map((post, i) => {
          if (!post) return <div key={`pad-${i}`} className={`${styles.cell} ${styles.cellEmpty}`} />;
          const isRead = readSlugs.has(post.slug);
          const color = getTopicColor(post.topic);
          const day = post.date.slice(8); // "06"
          return (
            <Link
              key={post.slug}
              href={`/${post.slug}`}
              className={`${styles.cell} ${isRead ? styles.cellRead : styles.cellUnread} ${loading ? styles.cellUnread : ""}`}
              style={{ background: color }}
              title={post.title}
            >
              <span className={styles.cellDay} style={{ color: "#fff" }}>
                {day}
              </span>
              <span className={styles.tooltip}>{post.title}</span>
            </Link>
          );
        })}
      </div>

      {/* 统计 */}
      {!loading && (
        <div className={styles.statsRow}>
          <div>
            <span className={styles.statsNum}>{readCount}</span>
            已读
          </div>
          <div>
            <span className={styles.statsNum}>{posts.length - readCount}</span>
            未读
          </div>
          <div>
            <span className={styles.statsNum}>{posts.length}</span>
            共计
          </div>
        </div>
      )}
    </div>
  );
}
