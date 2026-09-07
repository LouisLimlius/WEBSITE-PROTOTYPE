import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";

const DOSEN_COOKIE = "kk_dosen";
const DOSEN_PIN = process.env.KOMTING_PIN ?? process.env.DOSEN_PIN ?? "komting123";

export async function isDosen(): Promise<boolean> {
  try {
    const store = await cookies();
    return store.get(DOSEN_COOKIE)?.value === "ok";
  } catch {
    // dipanggil dari route handler dengan NextRequest
    return false;
  }
}

export function isDosenRequest(req: NextRequest): boolean {
  return req.cookies.get(DOSEN_COOKIE)?.value === "ok";
}

export function verifyDosenPin(pin: string): boolean {
  return pin === DOSEN_PIN;
}

export function setDosenCookie(res: NextResponse) {
  res.cookies.set(DOSEN_COOKIE, "ok", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearDosenCookie(res: NextResponse) {
  res.cookies.set(DOSEN_COOKIE, "", { path: "/", maxAge: 0 });
}

/** Ambil mahasiswa dari header `x-student-token`. */
export async function studentFromRequest(req: NextRequest) {
  const token = req.headers.get("x-student-token") ?? "";
  if (!token) return null;
  const rows = await db
    .select()
    .from(students)
    .where(eq(students.token, token))
    .limit(1);
  return rows[0] ?? null;
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
