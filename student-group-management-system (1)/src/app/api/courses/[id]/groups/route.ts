import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { courses, groups } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { isDosenRequest, jsonError } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  if (!isDosenRequest(req)) return jsonError("Khusus komting.", 403);
  const { id } = await ctx.params;

  const courseRows = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  if (courseRows.length === 0) return jsonError("Mata kuliah tidak ditemukan.", 404);

  const body = await req.json().catch(() => ({}));
  let name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    const existing = await db
      .select({ id: groups.id })
      .from(groups)
      .where(eq(groups.courseId, id))
      .orderBy(asc(groups.createdAt));
    name = `Kelompok ${existing.length + 1}`;
  }
  if (name.length > 60) return jsonError("Nama kelompok maksimal 60 karakter.");

  const rows = await db.insert(groups).values({ courseId: id, name }).returning();
  return NextResponse.json({ group: rows[0] });
}
