import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/db";
import { students } from "@/db/schema";
import { jsonError } from "@/lib/auth";

/** Check-in mahasiswa: NIM + nama -> identitas sesi (token). */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const nim = typeof body?.nim === "string" ? body.nim.trim().replace(/\s+/g, "") : "";
  const name = typeof body?.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";

  if (nim.length < 3 || nim.length > 30) {
    return jsonError("NIM tidak valid (3–30 karakter).");
  }
  if (name.length < 3 || name.length > 80) {
    return jsonError("Nama tidak valid (3–80 karakter).");
  }

  const token = randomUUID();
  const rows = await db
    .insert(students)
    .values({ nim, name, token })
    .onConflictDoUpdate({
      target: students.nim,
      set: { name, token },
    })
    .returning();

  const s = rows[0];
  return NextResponse.json({
    student: { id: s.id, nim: s.nim, name: s.name, token: s.token },
  });
}
