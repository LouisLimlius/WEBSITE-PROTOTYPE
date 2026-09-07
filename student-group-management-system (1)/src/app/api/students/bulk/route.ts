import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { isDosenRequest } from "@/lib/auth";

/** Tambah daftar mahasiswa massal (dosen). Format per baris: "NIM Nama" atau "NIM, Nama". */
export async function POST(req: NextRequest) {
  if (!isDosenRequest(req)) {
    return NextResponse.json({ error: "Khusus komting. Aktifkan Mode Komting dulu." }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const text = typeof body?.text === "string" ? body.text : "";

  const lines = text.split(/\r?\n/);
  const parsed: { nim: string; name: string }[] = [];
  let skipped = 0;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    let nim = "";
    let name = "";
    if (line.includes(",")) {
      const [a, ...rest] = line.split(",");
      nim = (a ?? "").trim();
      name = rest.join(",").trim();
    } else {
      const parts = line.split(/\s+/);
      nim = parts[0] ?? "";
      name = parts.slice(1).join(" ").trim();
    }
    if (nim.length < 3 || name.length < 3) {
      skipped++;
      continue;
    }
    parsed.push({ nim, name });
  }

  // dedupe berdasarkan NIM
  const seen = new Map<string, string>();
  for (const p of parsed) seen.set(p.nim, p.name);
  const unique = [...seen.entries()].map(([nim, name]) => ({ nim, name }));

  let added = 0;
  if (unique.length > 0) {
    const inserted = await db
      .insert(students)
      .values(unique)
      .onConflictDoNothing({ target: students.nim })
      .returning({ id: students.id });
    added = inserted.length;
  }

  return NextResponse.json({ added, skipped, existed: unique.length - added });
}
