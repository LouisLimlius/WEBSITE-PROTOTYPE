import { NextRequest, NextResponse } from "next/server";
import { studentFromRequest, jsonError } from "@/lib/auth";
import { getStudentGroups } from "@/lib/data";
import { db } from "@/db";
import { votes } from "@/db/schema";
import { eq } from "drizzle-orm";

/** Profil mahasiswa saat ini + kelompok yang diikuti + suara voting saya. */
export async function GET(req: NextRequest) {
  const student = await studentFromRequest(req);
  if (!student) return jsonError("Sesi tidak ditemukan. Silakan check-in ulang.", 401);
  const groups = await getStudentGroups(student.id);
  const myVotes = await db
    .select({ groupId: votes.groupId, candidateId: votes.candidateId })
    .from(votes)
    .where(eq(votes.voterId, student.id));
  return NextResponse.json({
    student: { id: student.id, nim: student.nim, name: student.name },
    groups,
    myVotes,
  });
}
