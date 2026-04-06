import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // 安全检查：防止路径穿越
  if (!slug || slug.includes("..") || slug.includes("/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const htmlPath = path.join(process.cwd(), "posts", `${slug}.html`);

  if (!fs.existsSync(htmlPath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const raw = fs.readFileSync(htmlPath, "utf8");
  // 去掉顶部 JSON 元数据注释，返回纯 HTML
  const html = raw.replace(/^<!--\s*\{[\s\S]*?\}\s*-->/, "").trim();

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
