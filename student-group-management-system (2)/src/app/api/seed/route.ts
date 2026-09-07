import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/db";
import { courses, groups, memberships, students, votes } from "@/db/schema";
import { sql } from "drizzle-orm";
import { jsonError } from "@/lib/auth";

/** Muat data contoh — hanya berjalan saat database masih kosong. */
export async function POST() {
  const [c] = await db.select({ count: sql<number>`count(*)::int` }).from(courses);
  if ((c?.count ?? 0) > 0) {
    return jsonError("Database sudah berisi data — contoh hanya bisa dimuat saat kosong.", 409);
  }

  const courseRows = await db
    .insert(courses)
    .values([
      { name: "Pendidikan Agama", code: "PAI-101", lecturer: "Dr. Hj. Siti Maryam, M.Ag.", maxMembers: 3 },
      { name: "Algoritma & Struktur Data", code: "IF-201", lecturer: "Budi Santoso, S.Kom., M.Kom.", maxMembers: 4 },
      { name: "Kewarganegaraan", code: "PKN-102", lecturer: "Drs. Agus Wijaya, M.Si.", maxMembers: 3 },
    ])
    .returning();

  const NAMES: { nim: string; name: string }[] = [
    { nim: "2355201001", name: "Aditya Pratama" },
    { nim: "2355201002", name: "Nabila Rahma" },
    { nim: "2355201003", name: "Fajar Nugroho" },
    { nim: "2355201004", name: "Salsabila Zahra" },
    { nim: "2355201005", name: "Rizky Ramadhan" },
    { nim: "2355201006", name: "Putri Ayu Lestari" },
    { nim: "2355201007", name: "Dimas Aryo Wibowo" },
    { nim: "2355201008", name: "Intan Permata Sari" },
    { nim: "2355201009", name: "Bagas Setiawan" },
    { nim: "2355201010", name: "Tiara Anindya" },
    { nim: "2355201011", name: "Rafi Akbar Maulana" },
    { nim: "2355201012", name: "Kirana Dewi Astuti" },
    { nim: "2355201013", name: "Yoga Firmansyah" },
    { nim: "2355201014", name: "Amara Syakila" },
    { nim: "2355201015", name: "Hamdan Al-Farizi" },
    { nim: "2355201016", name: "Naura Safitri" },
  ];

  const studentRows = await db
    .insert(students)
    .values(NAMES.map((s, i) => ({ ...s, token: i < 8 ? randomUUID() : null })))
    .returning();
  const S = (i: number) => studentRows[i].id;

  const g = await db
    .insert(groups)
    .values([
      { courseId: courseRows[0].id, name: "Kelompok 1" },
      { courseId: courseRows[0].id, name: "Kelompok 2" },
      { courseId: courseRows[1].id, name: "Kelompok 1" },
      { courseId: courseRows[1].id, name: "Kelompok 2" },
      { courseId: courseRows[2].id, name: "Kelompok 1" },
    ])
    .returning();

  await db.insert(memberships).values([
    // Agama K1 — penuh (3)
    { groupId: g[0].id, studentId: S(0) },
    { groupId: g[0].id, studentId: S(1) },
    { groupId: g[0].id, studentId: S(2) },
    // Agama K2 — 2 orang
    { groupId: g[1].id, studentId: S(3) },
    { groupId: g[1].id, studentId: S(4) },
    // Algo K1 — penuh (4)
    { groupId: g[2].id, studentId: S(5) },
    { groupId: g[2].id, studentId: S(6) },
    { groupId: g[2].id, studentId: S(7) },
    { groupId: g[2].id, studentId: S(8) },
    // Algo K2 — 1 orang
    { groupId: g[3].id, studentId: S(9) },
    // PKN K1 — penuh (3), belum voting
    { groupId: g[4].id, studentId: S(10) },
    { groupId: g[4].id, studentId: S(11) },
    { groupId: g[4].id, studentId: S(12) },
  ]);

  await db.insert(votes).values([
    // Agama K1: Aditya terpilih mayoritas 2/3
    { groupId: g[0].id, voterId: S(1), candidateId: S(0) },
    { groupId: g[0].id, voterId: S(2), candidateId: S(0) },
    { groupId: g[0].id, voterId: S(0), candidateId: S(1) },
    // Algo K1: seri 2-2 belum ada mayoritas
    { groupId: g[2].id, voterId: S(5), candidateId: S(6) },
    { groupId: g[2].id, voterId: S(7), candidateId: S(6) },
    { groupId: g[2].id, voterId: S(6), candidateId: S(8) },
  ]);

  return NextResponse.json({ ok: true });
}
