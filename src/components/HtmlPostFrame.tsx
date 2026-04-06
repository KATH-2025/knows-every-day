"use client";

interface Props {
  slug: string;
}

// 通过 API 路由加载 HTML（比 srcdoc 在移动端更可靠）
// 父容器控制高度，iframe 填满 100%
export default function HtmlPostFrame({ slug }: Props) {
  return (
    <iframe
      src={`/api/raw/${slug}`}
      title="post content"
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        display: "block",
      }}
    />
  );
}
