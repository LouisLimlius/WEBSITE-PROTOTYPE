import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { memberships, votes } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";
import { studentFromRequest, jsonError } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const student = await studentFromRequest(req);
  if (!student) return jsonError("Sesi tidak ditemukan. Silakan check-in ulang.", 401);
  const { id } = await ctx.params;

  await db
    .delete(memberships)
    .where(and(eq(memberships.groupId, id), eq(memberships.studentId, student.id)));

  // bersihkan suara terkait mahasiswa ini di kelompok tersebut
  await db
    .delete(votes)
    .where(
      and(
        eq(votes.groupId, id),
        or(eq(votes.voterId, student.id), eq(votes.candidateId, student.id))
      )
    );

  return NextResponse.json({ ok: true });
}
