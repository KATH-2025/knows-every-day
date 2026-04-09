import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

// DELETE /api/annotations/[id]?userId=xxx
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId || !id) return NextResponse.json({ ok: false }, { status: 400 });

  const sql = getDB();
  if (!sql) return NextResponse.json({ ok: false }, { status: 503 });

  try {
    await sql`DELETE FROM annotations WHERE id = ${id} AND user_id = ${userId}`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// PATCH /api/annotations/[id]  body: { userId, note }  → 更新笔记文字
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json() as { userId?: string; note?: string };
    const { userId, note } = body;
    if (!userId || !id) return NextResponse.json({ ok: false }, { status: 400 });

    const sql = getDB();
    if (!sql) return NextResponse.json({ ok: false }, { status: 503 });

    await sql`UPDATE annotations SET note = ${note ?? null} WHERE id = ${id} AND user_id = ${userId}`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
