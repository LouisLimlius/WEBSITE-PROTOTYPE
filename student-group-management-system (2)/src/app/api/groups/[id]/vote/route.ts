import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { courses, groups, memberships, votes } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { studentFromRequest, jsonError } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

async function context(id: string) {
  const rows = await db
    .select({ group: groups, course: courses })
    .from(groups)
    .innerJoin(courses, eq(courses.id, groups.courseId))
    .where(eq(groups.id, id))
    .limit(1);
  return rows[0] ?? null;
}

async function memberIds(groupId: string): Promise<string[]> {
  const rows = await db
    .select({ studentId: memberships.studentId })
    .from(memberships)
    .where(eq(memberships.groupId, groupId));
  return rows.map((r) => r.studentId);
}

/** Memilih / mengganti pilihan ketua (suara lama otomatis tertimpa). */
export async function POST(req: NextRequest, ctx: Ctx) {
  const student = await studentFromRequest(req);
  if (!student) return jsonError("Kamu harus check-in dulu untuk ikut voting.", 401);
  const { id } = await ctx.params;

  const ctxRow = await context(id);
  if (!ctxRow) return jsonError("Kelompok tidak ditemukan.", 404);
  const { group, course } = ctxRow;

  const body = await req.json().catch(() => ({}));
  const candidateId = typeof body?.candidateId === "string" ? body.candidateId : "";

  const ids = await memberIds(group.id);
  if (!ids.includes(student.id)) {
    return jsonError("Hanya anggota kelompok yang boleh voting.", 403);
  }
  if (!ids.includes(candidateId)) {
    return jsonError("Kandidat bukan anggota kelompok ini.", 400);
  }
  if (ids.length < course.maxMembers) {
    return jsonError(`Voting baru dibuka setelah kelompok penuh (${ids.length}/${course.maxMembers}).`, 409);
  }

  const existing = await db
    .select()
    .from(votes)
    .where(and(eq(votes.groupId, group.id), eq(votes.voterId, student.id)))
    .limit(1);

  const previous = existing[0]?.candidateId ?? null;

  await db
    .insert(votes)
    .values({ groupId: group.id, voterId: student.id, candidateId })
    .onConflictDoUpdate({
      target: [votes.groupId, votes.voterId],
      set: { candidateId, createdAt: new Date() },
    });

  return NextResponse.json({ ok: true, changed: previous !== null && previous !== candidateId });
}

/** Menarik kembali suara ("kick vote") — dilakukan sebelum memilih kandidat baru. */
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const student = await studentFromRequest(req);
  if (!student) return jsonError("Sesi tidak ditemukan.", 401);
  const { id } = await ctx.params;

  await db
    .delete(votes)
    .where(and(eq(votes.groupId, id), eq(votes.voterId, student.id)));

  return NextResponse.json({ ok: true });
}
