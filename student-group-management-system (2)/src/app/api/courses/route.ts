import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { isDosenRequest, jsonError } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!isDosenRequest(req)) {
    return jsonError("Khusus komting. Aktifkan Mode Komting dulu.", 403);
  }
  const body = await req.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  const lecturer = typeof body?.lecturer === "string" ? body.lecturer.trim() : "";
  const maxMembers = Number(body?.maxMembers);

  if (name.length < 3 || name.length > 80) return jsonError("Nama mata kuliah 3–80 karakter.");
  if (!Number.isInteger(maxMembers) || maxMembers < 2 || maxMembers > 20) {
    return jsonError("Kuota anggota harus angka 2–20.");
  }

  const rows = await db
    .insert(courses)
    .values({ name, code, lecturer, maxMembers })
    .returning();
  return NextResponse.json({ course: rows[0] });
}
