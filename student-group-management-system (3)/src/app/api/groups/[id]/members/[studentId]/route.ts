import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { memberships, votes } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";
import { isDosenRequest, jsonError } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string; studentId: string }> };

/** Dosen mengeluarkan anggota dari kelompok. */
export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!isDosenRequest(req)) return jsonError("Khusus komting.", 403);
  const { id, studentId } = await ctx.params;

  await db
    .delete(memberships)
    .where(and(eq(memberships.groupId, id), eq(memberships.studentId, studentId)));

  await db
    .delete(votes)
    .where(
      and(
        eq(votes.groupId, id),
        or(eq(votes.voterId, studentId), eq(votes.candidateId, studentId))
      )
    );

  return NextResponse.json({ ok: true });
}
