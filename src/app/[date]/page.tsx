import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPost, getAllPostsMeta, getAdjacentSlugs } from "@/lib/posts";
import Masthead from "@/components/Masthead";
import IssueBar from "@/components/IssueBar";
import PostCover from "@/components/PostCover";
import HtmlPostFrame from "@/components/HtmlPostFrame";
import SiteFooter from "@/components/SiteFooter";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ date: string }>;
}

export async function generateStaticParams() {
  const metas = getAllPostsMeta();
  return metas.map((m) => ({ date: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const post = await getPost(date);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} — 每日一识`,
    description: post.excerpt,
  };
}

export default async function DatePage({ params }: Props) {
  const { date } = await params;
  const post = await getPost(date);
  if (!post) notFound();

  const allMetas = getAllPostsMeta();
  const { prev, next } = getAdjacentSlugs(post.slug);
  const currentIndex = allMetas.length - allMetas.findIndex((m) => m.slug === post.slug);
  const dateLabel = post.date.replace(/-/g, ".");

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
          {post.isFullPage ? (
            <HtmlPostFrame slug={post.slug} />
          ) : (
            <div className="prose" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
          )}

          {post.tags.length > 0 && (
            <div className={styles.tags}>
              {post.tags.map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
        </article>

        <SiteFooter />
      </div>
    </main>
  );
}
