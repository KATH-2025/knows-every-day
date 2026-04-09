"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Annotation } from "@/types";
import styles from "./page.module.css";

function getUserId(): string {
  let id = localStorage.getItem("ke_user_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("ke_user_id", id); }
  return id;
}

export default function NotesPage() {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getUserId();
    fetch(`/api/annotations?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        const d = data as { annotations?: Annotation[] };
        setAnnotations(d.annotations ?? []);
      })
      .catch(() => setAnnotations([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    const userId = getUserId();
    await fetch(`/api/annotations/${id}?userId=${userId}`, { method: "DELETE" });
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  };

  // 按 slug 分组
  const grouped = annotations.reduce<Record<string, Annotation[]>>((acc, ann) => {
    (acc[ann.slug] ??= []).push(ann);
    return acc;
  }, {});

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.pageNav}>
          <Link href="/" className={styles.backLink}>← BACK</Link>
          <span className={styles.pageTitle}>MY NOTES</span>
        </div>

        {loading && <p className={styles.empty}>加载中...</p>}

        {!loading && annotations.length === 0 && (
          <p className={styles.empty}>还没有笔记。在文章里选中文字，点「划线」或「笔记」开始记录。</p>
        )}

        {!loading && Object.entries(grouped).map(([slug, anns]) => (
          <div key={slug} className={styles.group}>
            <Link href={`/${slug}`} className={styles.groupTitle}>{slug} →</Link>
            {anns.map((ann) => (
              <div key={ann.id} className={styles.card}>
                <div className={styles.quote}>"{ann.selected_text.slice(0, 120)}{ann.selected_text.length > 120 ? "…" : ""}"</div>
                {ann.note && <div className={styles.note}>{ann.note}</div>}
                <div className={styles.meta}>
                  <span className={styles.date}>{new Date(ann.created_at).toLocaleDateString("zh-CN")}</span>
                  <button className={styles.del} onClick={() => handleDelete(ann.id)}>删除</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
