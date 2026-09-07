import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { courses, groups, memberships } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { isDosenRequest, jsonError } from "@/lib/auth";
import { listUnassigned } from "@/lib/data";

type Ctx = { params: Promise<{ id: string }> };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Distribusi acak: isi slot kelompok yang belum penuh,
 * lalu bentuk kelompok baru untuk sisa mahasiswa.
 */
export async function POST(req: NextRequest, ctx: Ctx) {
  if (!isDosenRequest(req)) return jsonError("Khusus komting.", 403);
  const { id } = await ctx.params;

  const courseRows = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  if (courseRows.length === 0) return jsonError("Mata kuliah tidak ditemukan.", 404);
  const course = courseRows[0];

  const unassigned = shuffle(await listUnassigned(id));
  if (unassigned.length === 0) {
    return jsonError("Semua mahasiswa sudah punya kelompok di mata kuliah ini.");
  }

  const groupRows = await db
    .select()
    .from(groups)
    .where(eq(groups.courseId, id))
    .orderBy(asc(groups.createdAt));

  const countRows = await db
    .select({ groupId: memberships.groupId, count: sql<number>`count(*)::int` })
    .from(memberships)
    .innerJoin(groups, eq(groups.id, memberships.groupId))
    .where(eq(groups.courseId, id))
    .groupBy(memberships.groupId);
  const countMap = new Map(countRows.map((c) => [c.groupId, c.count]));

  const queue = [...unassigned];
  let assigned = 0;
  let createdGroups = 0;

  // 1) isi kelompok yang masih punya slot
  for (const g of groupRows) {
    const count = countMap.get(g.id) ?? 0;
    const slots = course.maxMembers - count;
    if (slots <= 0 || queue.length === 0) continue;
    const take = queue.splice(0, slots);
    if (take.length > 0) {
      await db
        .insert(memberships)
        .values(take.map((s) => ({ groupId: g.id, studentId: s.id })))
        .onConflictDoNothing();
      assigned += take.length;
    }
  }

  // 2) buat kelompok baru dari sisa antrian
  let nextNumber = groupRows.length + 1;
  while (queue.length > 0) {
    const chunk = queue.splice(0, course.maxMembers);
    const newGroup = await db
      .insert(groups)
      .values({ courseId: id, name: `Kelompok ${nextNumber}` })
      .returning();
    await db
      .insert(memberships)
      .values(chunk.map((s) => ({ groupId: newGroup[0].id, studentId: s.id })));
    nextNumber++;
    createdGroups++;
    assigned += chunk.length;
  }

  return NextResponse.json({ assigned, createdGroups });
}
