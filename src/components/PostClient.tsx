"use client";
import { useEffect } from "react";
import AnnotationLayer from "./AnnotationLayer";

interface Props {
  slug: string;
  showAnnotations?: boolean; // false = 全页 HTML（iframe），不支持划线
}

function getUserId(): string {
  let id = localStorage.getItem("ke_user_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("ke_user_id", id); }
  return id;
}

export default function PostClient({ slug, showAnnotations = true }: Props) {
  // 进入页面自动标记已读
  useEffect(() => {
    const userId = getUserId();
    fetch("/api/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, slug }),
    }).catch(() => {});
  }, [slug]);

  if (!showAnnotations) return null;
  return <AnnotationLayer slug={slug} />;
}
