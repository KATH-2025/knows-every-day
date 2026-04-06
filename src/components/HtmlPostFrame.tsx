"use client";

interface Props {
  html: string;
}

/**
 * 用 iframe 隔离渲染完整 HTML 文档，避免 CSS / JS 污染外层网站。
 * 高度占满视口剩余空间（减去顶部网站 chrome 的高度），内部正常滚动。
 * 不使用自适应高度——因为含 min-height:100vh 的 hero 区会导致无限扩张。
 */
export default function HtmlPostFrame({ html }: Props) {
  return (
    <iframe
      srcDoc={html}
      title="post content"
      style={{
        width: "100%",
        /* 220px ≈ Masthead + IssueBar + kicker + h1 的总高度 */
        height: "calc(100vh - 220px)",
        minHeight: "480px",
        border: "none",
        display: "block",
      }}
    />
  );
}
