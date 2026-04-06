import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import type { Post, PostMeta, SearchIndex, SiteStats } from "@/types";

const postsDirectory = path.join(process.cwd(), "posts");

/** 返回北京时间（UTC+8）的当前日期字符串，格式 "2025-07-11" */
export function getBeijingDateStr(): string {
  const now = new Date();
  const beijing = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return beijing.toISOString().slice(0, 10);
}

function ensurePostsDir() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
}

// ── HTML 文件解析 ────────────────────────────────────────────────

/**
 * 从 HTML 文件顶部读取 JSON 注释元数据。
 * 格式：<!-- { "title": "...", "date": "...", ... } -->
 */
function parseHtmlMeta(src: string): Record<string, unknown> {
  const match = src.match(/^<!--\s*(\{[\s\S]*?\})\s*-->/);
  if (!match) return {};
  try {
    return JSON.parse(match[1]);
  } catch {
    return {};
  }
}

/**
 * 从 HTML 文件提取可渲染内容：
 * - 若是完整页面（含 <body>），提取 <head> 里的 <style> + <body> 内容
 * - 若是片段，直接使用全文（去掉顶部 JSON 注释）
 */
function extractHtmlContent(src: string): string {
  // 去掉顶部 JSON 注释
  const stripped = src.replace(/^<!--\s*\{[\s\S]*?\}\s*-->/, "").trim();

  const hasBody = /<body[\s\S]*?>/i.test(stripped);

  if (!hasBody) {
    // 纯片段，直接用
    return stripped;
  }

  // 完整页面：提取 <head> 中的 <style> 标签
  const styles: string[] = [];
  const headMatch = stripped.match(/<head[\s\S]*?>([\s\S]*?)<\/head>/i);
  if (headMatch) {
    const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let m;
    while ((m = styleRe.exec(headMatch[1])) !== null) {
      styles.push(`<style>${m[1]}</style>`);
    }
  }

  // 提取 <body> 内容
  const bodyMatch = stripped.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1].trim() : stripped;

  return (styles.length ? styles.join("\n") + "\n" : "") + bodyContent;
}

/** 从 HTML 内容中提取纯文字摘要 */
function htmlToExcerpt(htmlStr: string): string {
  return htmlStr
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

// ── 统一读取一篇文章（支持 .html 和 .md）────────────────────────

type RawPost = { meta: Record<string, unknown>; contentHtml: string; excerpt: string; isFullPage?: boolean };

async function readPostFile(slug: string): Promise<RawPost | null> {
  ensurePostsDir();

  // .html 优先
  const htmlPath = path.join(postsDirectory, `${slug}.html`);
  if (fs.existsSync(htmlPath)) {
    const src = fs.readFileSync(htmlPath, "utf8");
    const meta = parseHtmlMeta(src);
    const hasBody = /<body[\s\S]*?>/i.test(src);

    if (hasBody) {
      // 完整 HTML 页面：去掉 JSON 注释头，原文返回（用 iframe 渲染，避免 CSS 污染）
      const contentHtml = src.replace(/^<!--\s*\{[\s\S]*?\}\s*-->/, "").trim();
      const excerpt = htmlToExcerpt(contentHtml);
      return { meta, contentHtml, excerpt, isFullPage: true };
    } else {
      // 纯片段：直接嵌入
      const contentHtml = extractHtmlContent(src);
      const excerpt = htmlToExcerpt(contentHtml);
      return { meta, contentHtml, excerpt, isFullPage: false };
    }
  }

  // 回退 .md
  const mdPath = path.join(postsDirectory, `${slug}.md`);
  if (fs.existsSync(mdPath)) {
    const src = fs.readFileSync(mdPath, "utf8");
    const { data, content } = matter(src);
    const processed = await remark().use(html, { sanitize: false }).process(content);
    const contentHtml = processed.toString();
    const excerpt = content.replace(/[#*`>\-\[\]]/g, "").trim().slice(0, 100);
    return { meta: data as Record<string, unknown>, contentHtml, excerpt };
  }

  return null;
}

// ── 列出所有 slug（去重，.html 优先）────────────────────────────

function listSlugs(): string[] {
  ensurePostsDir();
  const files = fs.readdirSync(postsDirectory);
  const slugSet = new Map<string, string>(); // slug → 文件名

  for (const f of files) {
    if (f.startsWith("_")) continue; // 跳过模板文件
    if (f.endsWith(".html")) {
      slugSet.set(f.replace(/\.html$/, ""), f);
    } else if (f.endsWith(".md") && !slugSet.has(f.replace(/\.md$/, ""))) {
      slugSet.set(f.replace(/\.md$/, ""), f);
    }
  }

  return Array.from(slugSet.keys()).sort().reverse();
}

// ── 公开 API ─────────────────────────────────────────────────────

/** 获取所有文章的元数据列表，按日期降序 */
export function getAllPostsMeta(): PostMeta[] {
  return listSlugs().map((slug) => {
    ensurePostsDir();

    // 同步读取 meta（不需要 remark，只取 frontmatter）
    const htmlPath = path.join(postsDirectory, `${slug}.html`);
    const mdPath = path.join(postsDirectory, `${slug}.md`);

    let meta: Record<string, unknown> = {};
    let excerpt = "";

    if (fs.existsSync(htmlPath)) {
      const src = fs.readFileSync(htmlPath, "utf8");
      meta = parseHtmlMeta(src);
      excerpt = htmlToExcerpt(extractHtmlContent(src));
    } else if (fs.existsSync(mdPath)) {
      const src = fs.readFileSync(mdPath, "utf8");
      const { data, content } = matter(src);
      meta = data as Record<string, unknown>;
      excerpt = content.replace(/[#*`>\-\[\]]/g, "").trim().slice(0, 100);
    }

    return {
      slug,
      title: String(meta.title ?? slug),
      date: String(meta.date ?? slug),
      topic: String(meta.topic ?? "未分类"),
      tags: Array.isArray(meta.tags) ? (meta.tags as string[]) : [],
      image: meta.image ? String(meta.image) : undefined,
      excerpt,
    } as PostMeta;
  });
}

/** 获取单篇文章（含渲染后 HTML） */
export async function getPost(slug: string): Promise<Post | null> {
  const raw = await readPostFile(slug);
  if (!raw) return null;
  const { meta, contentHtml, excerpt, isFullPage } = raw;

  return {
    slug,
    title: String(meta.title ?? slug),
    date: String(meta.date ?? slug),
    topic: String(meta.topic ?? "未分类"),
    tags: Array.isArray(meta.tags) ? (meta.tags as string[]) : [],
    image: meta.image ? String(meta.image) : undefined,
    excerpt,
    contentHtml,
    isFullPage,
  };
}

/** 获取最新一篇 */
export async function getLatestPost(): Promise<Post | null> {
  const metas = getAllPostsMeta();
  if (metas.length === 0) return null;
  return getPost(metas[0].slug);
}

/** 构建搜索索引（用于前端静态过滤） */
export function buildSearchIndex(): SearchIndex[] {
  return getAllPostsMeta().map((m) => ({
    slug: m.slug,
    title: m.title,
    date: m.date,
    topic: m.topic,
    tags: m.tags,
    excerpt: m.excerpt ?? "",
  }));
}

/** 计算统计数据 */
export function getSiteStats(): SiteStats {
  const metas = getAllPostsMeta();
  const total = metas.length;
  const topics = new Set(metas.map((m) => m.topic));
  const topicCount = topics.size;

  // 计算当前连续天数（基于北京时间）
  let streak = 0;
  const todayStr = getBeijingDateStr(); // "2025-07-11"
  const slugSet = new Set(metas.map((m) => m.slug));

  for (let i = 0; ; i++) {
    const d = new Date(todayStr + "T00:00:00+08:00");
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (slugSet.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return { total, topicCount, streak };
}

/** 获取某篇的前后篇 slug */
export function getAdjacentSlugs(slug: string): { prev: string | null; next: string | null } {
  const metas = getAllPostsMeta(); // 降序
  const idx = metas.findIndex((m) => m.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx + 1 < metas.length ? metas[idx + 1].slug : null,  // 更早
    next: idx - 1 >= 0 ? metas[idx - 1].slug : null,            // 更新
  };
}
