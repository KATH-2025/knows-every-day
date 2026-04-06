"use client";

interface Props {
  slug: string;
}

// 通过 API 路由加载 HTML（比 srcdoc 在移动端更可靠）
export default function HtmlPostFrame({ slug }: Props) {
  return (
    <iframe
      src={`/api/raw/${slug}`}
      title="post content"
      style={{
        width: "100%",
        height: "calc(100dvh - 160px)",
        minHeight: "480px",
        border: "none",
        display: "block",
      }}
    />
  );
}
