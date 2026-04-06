"use client";

import { useRef, useEffect } from "react";

interface Props {
  slug: string;
}

/**
 * 通过 API 路由加载 HTML（同源 iframe，手机端可靠）。
 * 用 sessionStorage 记录每篇文章的阅读位置：
 *   - 离开页面前自动保存
 *   - 返回同一篇时自动滚回原位
 */
export default function HtmlPostFrame({ slug }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const key = `scroll_${slug}`;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const onLoad = () => {
      const win = iframe.contentWindow;
      if (!win) return;

      // 恢复阅读位置
      const saved = sessionStorage.getItem(key);
      if (saved) {
        win.scrollTo({ top: parseInt(saved, 10), behavior: "instant" });
      }

      // 实时保存滚动位置
      const onScroll = () => {
        sessionStorage.setItem(key, String(win.scrollY));
      };
      win.addEventListener("scroll", onScroll, { passive: true });
    };

    iframe.addEventListener("load", onLoad);
    return () => iframe.removeEventListener("load", onLoad);
  }, [slug, key]);

  return (
    <iframe
      ref={iframeRef}
      src={`/api/raw/${slug}`}
      title="post content"
      style={{ width: "100%", height: "100%", border: "none", display: "block" }}
    />
  );
}
