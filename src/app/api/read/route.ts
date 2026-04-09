import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

// GET /api/read?userId=xxx → 返回该用户所有已读 slug 列表
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ slugs: [] });

  const sql = getDB();
  if (!sql) return NextResponse.json({ slugs: [] });

  try {
    const rows = await sql`SELECT slug FROM read_history WHERE user_id = ${userId}`;
    return NextResponse.json({ slugs: rows.map((r) => r.slug as string) });
  } catch {
    return NextResponse.json({ slugs: [] });
  }
}

// POST /api/read  body: { userId, slug }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { userId?: string; slug?: string };
    const { userId, slug } = body;
    if (!userId || !slug) return NextResponse.json({ ok: false }, { status: 400 });

    const sql = getDB();
    if (!sql) return NextResponse.json({ ok: true }); // 降级：静默忽略

    await sql`
      INSERT INTO read_history (user_id, slug, read_at)
      VALUES (${userId}, ${slug}, ${Date.now()})
      ON CONFLICT (user_id, slug) DO NOTHING
    `;

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
