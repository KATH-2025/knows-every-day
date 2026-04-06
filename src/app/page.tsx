import Link from "next/link";
import { getAllPostsMeta, getLatestPost, buildSearchIndex, getAdjacentSlugs } from "@/lib/posts";
import Masthead from "@/components/Masthead";
import IssueBar from "@/components/IssueBar";
import PostCover from "@/components/PostCover";
import HtmlPostFrame from "@/components/HtmlPostFrame";
import HistoryList from "@/components/HistoryList";
import SearchBar from "@/components/SearchBar";
import SiteFooter from "@/components/SiteFooter";
import styles from "./page.module.css";

export const revalidate = 3600;

export default async function HomePage() {
  const [post, allMetas, searchIndex] = await Promise.all([
    getLatestPost(),
    Promise.resolve(getAllPostsMeta()),
    Promise.resolve(buildSearchIndex()),
  ]);

  if (!post) {
    return (
      <main className={styles.page}>
        <div className={styles.wrap}>
          <Masthead />
          <div className={styles.empty}>
            在 <code>posts/</code> 目录下新建第一篇 Markdown 文件吧。
          </div>
        </div>
      </main>
    );
  }

  const { prev, next } = getAdjacentSlugs(post.slug);
  const currentIndex = allMetas.length - allMetas.findIndex((m) => m.slug === post.slug);
  const dateLabel = post.date.replace(/-/g, ".");
  const historyMetas = allMetas.slice(1, 9);

  // 全页 HTML：固定视口高度，禁止外层滚动，iframe 填满剩余空间
  if (post.isFullPage) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden", background: "var(--paper)" }}>
        <div style={{ flexShrink: 0, maxWidth: "var(--max-width)", width: "100%", margin: "0 auto", padding: "0 2rem" }}>
          <Masthead />
          <IssueBar
            left={`NO.${String(currentIndex).padStart(3, "0")}`}
            date={dateLabel}
            prev={prev}
            next={next}
          />
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <HtmlPostFrame slug={post.slug} />
        </div>
      </div>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <Masthead />
        <IssueBar
          left={`NO.${String(currentIndex).padStart(3, "0")}`}
          date={dateLabel}
          prev={prev}
          next={next}
        />

        <article>
          <div className={styles.kicker}>{post.topic}</div>
          <h1 className={styles.h1}>{post.title}</h1>
          <PostCover src={post.image} alt={post.title} />
          <div className="prose" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
          {post.tags.length > 0 && (
            <div className={styles.tags}>
              {post.tags.map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
        </article>

        <section className={styles.archiveSection}>
          <div className={styles.sectionRule}>
            <span className={styles.sectionLabel}>RECENT</span>
          </div>
          <HistoryList posts={historyMetas} />
          {allMetas.length > 9 && (
            <Link href="/archive" className={styles.moreLink}>
              SEE ALL {allMetas.length} ISSUES →
            </Link>
          )}
        </section>

        <SearchBar index={searchIndex} />
        <SiteFooter />
      </div>
    </main>
  );
}
