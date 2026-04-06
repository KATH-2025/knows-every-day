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
        /*
         * 用 100dvh（dynamic viewport height）而非 100vh：
         * - 手机 Safari 的 100vh 包含地址栏，内容会被遮住
         * - 100dvh 是地址栏收起后的真实可视区域
         * 减去约 160px 留给站点顶部（Masthead + IssueBar + h1）
         */
        height: "calc(100dvh - 160px)",
        minHeight: "480px",
        border: "none",
        display: "block",
        // 允许 iframe 内部触摸滚动（iOS Safari 必须）
        overflow: "auto",
      }}
    />
  );
}
