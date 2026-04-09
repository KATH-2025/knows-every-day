import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

// GET /api/annotations?userId=xxx&slug=yyy → 返回该用户在某篇文章的所有注释
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const slug = request.nextUrl.searchParams.get("slug");
  if (!userId || !slug) return NextResponse.json({ annotations: [] });

  const sql = getDB();
  if (!sql) return NextResponse.json({ annotations: [] });

  try {
    const rows = await sql`
      SELECT * FROM annotations
      WHERE user_id = ${userId} AND slug = ${slug}
      ORDER BY created_at ASC
    `;
    return NextResponse.json({ annotations: rows });
  } catch {
    return NextResponse.json({ annotations: [] });
  }
}

// POST /api/annotations  body: { userId, slug, selected_text, note? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { userId?: string; slug?: string; selected_text?: string; note?: string };
    const { userId, slug, selected_text, note } = body;
    if (!userId || !slug || !selected_text) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const sql = getDB();
    if (!sql) return NextResponse.json({ ok: false }, { status: 503 });

    const id = crypto.randomUUID();
    await sql`
      INSERT INTO annotations (id, user_id, slug, selected_text, note, created_at)
      VALUES (${id}, ${userId}, ${slug}, ${selected_text}, ${note ?? null}, ${Date.now()})
    `;

    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
