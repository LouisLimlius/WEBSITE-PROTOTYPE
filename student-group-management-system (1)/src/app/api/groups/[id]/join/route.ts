import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { courses, groups, memberships } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { studentFromRequest, jsonError } from "@/lib/auth";
import { studentGroupInCourse } from "@/lib/data";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const student = await studentFromRequest(req);
  if (!student) return jsonError("Kamu belum check-in. Isi NIM & nama dulu di halaman Gabung.", 401);

  const { id } = await ctx.params;
  const rows = await db
    .select({ group: groups, course: courses })
    .from(groups)
    .innerJoin(courses, eq(courses.id, groups.courseId))
    .where(eq(groups.id, id))
    .limit(1);
  if (rows.length === 0) return jsonError("Kelompok tidak ditemukan.", 404);
  const { group, course } = rows[0];

  const existing = await studentGroupInCourse(course.id, student.id);
  if (existing) {
    if (existing.groupId === id) return NextResponse.json({ ok: true, already: true });
    return jsonError(`Kamu sudah tergabung di "${existing.groupName}" untuk mata kuliah ini.`, 409);
  }

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(memberships)
    .where(eq(memberships.groupId, id));
  const count = countRow?.count ?? 0;
  if (count >= course.maxMembers) {
    return jsonError(`Kelompok sudah penuh (${course.maxMembers} orang). Cari kelompok lain ya.`, 409);
  }

  await db
    .insert(memberships)
    .values({ groupId: group.id, studentId: student.id })
    .onConflictDoNothing();

  return NextResponse.json({ ok: true });
}
