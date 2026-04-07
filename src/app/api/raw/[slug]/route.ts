import { NextRequest, NextResponse } from "next/server";
import postsData from "@/lib/posts-data.json";

type PostEntry = { content: string; ext: string };
const data = postsData as Record<string, PostEntry>;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // 安全检查：防止路径穿越
  if (!slug || slug.includes("..") || slug.includes("/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const entry = data[slug];
  if (!entry || entry.ext !== ".html") {
    return new NextResponse("Not found", { status: 404 });
  }

  // 去掉顶部 JSON 元数据注释，返回纯 HTML
  const html = entry.content.replace(/^<!--\s*\{[\s\S]*?\}\s*-->/, "").trim();

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
