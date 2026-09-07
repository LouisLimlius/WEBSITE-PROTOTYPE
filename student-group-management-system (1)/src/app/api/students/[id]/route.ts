import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isDosenRequest, jsonError } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

/** Hapus mahasiswa dari sistem sepenuhnya (otomatis melepas semua keanggotaan & suara voting-nya). */
export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!isDosenRequest(req)) return jsonError("Khusus komting.", 403);
  const { id } = await ctx.params;

  const rows = await db
    .delete(students)
    .where(eq(students.id, id))
    .returning({ name: students.name });

  if (rows.length === 0) return jsonError("Mahasiswa tidak ditemukan.", 404);
  return NextResponse.json({ ok: true, name: rows[0].name });
}
