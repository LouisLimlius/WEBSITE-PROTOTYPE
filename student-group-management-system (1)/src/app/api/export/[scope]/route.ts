import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { listCourses, listUnassigned } from "@/lib/data";

type Ctx = { params: Promise<{ scope: string }> };

const INK = "FF181510";
const GOLD = "FFFFC94D";
const CREAM = "FFFFF9EE";

function styleHeader(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: INK } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GOLD } };
    cell.border = {
      top: { style: "thin", color: { argb: INK } },
      left: { style: "thin", color: { argb: INK } },
      bottom: { style: "thin", color: { argb: INK } },
      right: { style: "thin", color: { argb: INK } },
    };
    cell.alignment = { vertical: "middle" };
  });
  row.height = 22;
}

function styleBody(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.border = {
      top: { style: "thin", color: { argb: INK } },
      left: { style: "thin", color: { argb: INK } },
      bottom: { style: "thin", color: { argb: INK } },
      right: { style: "thin", color: { argb: INK } },
    };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: CREAM } };
  });
}

function safeSheetName(name: string) {
  return name.replace(/[\[\]:*?/\\]/g, "-").slice(0, 31) || "Sheet";
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { scope } = await ctx.params;
  const all = await listCourses();
  const targets = scope === "all" ? all : all.filter((c) => c.id === scope);

  if (targets.length === 0) {
    return NextResponse.json({ error: "Tidak ada data untuk diekspor." }, { status: 404 });
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = "KelompokKu";
  wb.created = new Date();

  /* ========== Sheet Rekap ========== */
  const rekap = wb.addWorksheet("Rekap");
  rekap.columns = [
    { header: "", key: "a", width: 14 },
    { header: "", key: "b", width: 32 },
    { header: "", key: "c", width: 30 },
    { header: "", key: "d", width: 14 },
    { header: "", key: "e", width: 13 },
    { header: "", key: "f", width: 14 },
    { header: "", key: "g", width: 14 },
    { header: "", key: "h", width: 12 },
    { header: "", key: "i", width: 14 },
  ];
  const title = rekap.addRow(["REKAP PEMBENTUKAN KELOMPOK KULIAH"]);
  title.getCell(1).font = { bold: true, size: 15, color: { argb: INK } };
  rekap.mergeCells("A1:I1");
  const sub = rekap.addRow([
    `Diekspor ${new Date().toLocaleString("id-ID")} — KelompokKu`,
  ]);
  sub.getCell(1).font = { italic: true, size: 10, color: { argb: "FF6B6252" } };
  rekap.mergeCells("A2:I2");
  rekap.addRow([]);

  const header = rekap.addRow([
    "Kode",
    "Mata Kuliah",
    "Dosen Pengampu",
    "Kuota/Kelompok",
    "Kelompok",
    "Kelompok Penuh",
    "Ketua Terpilih",
    "Terdaftar",
    "Belum Dapat",
  ]);
  styleHeader(header);
  rekap.autoFilter = { from: "A4", to: "I4" };

  for (const c of targets) {
    styleBody(
      rekap.addRow([
        c.code || "-",
        c.name,
        c.lecturer || "-",
        c.maxMembers,
        c.groupCount,
        c.fullGroupCount,
        c.ketuaTerpilih,
        c.registeredCount,
        c.unassignedCount,
      ])
    );
  }

  /* ========== Sheet per Mata Kuliah ========== */
  for (const c of targets) {
    const ws = wb.addWorksheet(safeSheetName(`${c.code || c.name}`));
    ws.columns = [
      { width: 16 },
      { width: 14 },
      { width: 14 },
      { width: 26 },
      { width: 12 },
      { width: 8 },
      { width: 16 },
    ];
    const t = ws.addRow([`${c.code ? c.code + " — " : ""}${c.name}`]);
    t.getCell(1).font = { bold: true, size: 13, color: { argb: INK } };
    ws.mergeCells("A1:G1");
    const d = ws.addRow([`Dosen: ${c.lecturer || "-"} · Kuota ${c.maxMembers} orang/kelompok`]);
    d.getCell(1).font = { italic: true, size: 10, color: { argb: "FF6B6252" } };
    ws.mergeCells("A2:G2");
    ws.addRow([]);

    const h = ws.addRow(["Kelompok", "Status", "NIM", "Nama Mahasiswa", "Peran", "Suara", "Tgl Gabung"]);
    styleHeader(h);

    for (const g of c.groups) {
      const status = g.full ? "Penuh" : "Terbuka";
      if (g.members.length === 0) {
        styleBody(ws.addRow([g.name, status, "-", "(belum ada anggota)", "-", "", ""]));
        continue;
      }
      for (const m of g.members) {
        const row = ws.addRow([
          g.name,
          status,
          m.nim,
          m.name,
          m.isKetua ? "KETUA" : "Anggota",
          m.voteCount,
          new Date(m.joinedAt).toLocaleDateString("id-ID"),
        ]);
        styleBody(row);
        if (m.isKetua) {
          row.getCell(4).font = { bold: true };
          row.getCell(5).font = { bold: true };
        }
      }
    }
  }

  /* ========== Sheet Belum Dapat Kelompok ========== */
  const belum = wb.addWorksheet("Belum Dapat Kelompok");
  belum.columns = [{ width: 28 }, { width: 14 }, { width: 28 }, { width: 16 }];
  styleHeader(belum.addRow(["Mata Kuliah", "NIM", "Nama Mahasiswa", "Status Akun"]));
  let empty = true;
  for (const c of targets) {
    const rows = await listUnassigned(c.id);
    for (const s of rows) {
      empty = false;
      styleBody(
        belum.addRow([
          c.name,
          s.nim,
          s.name,
          s.checkedIn ? "Sudah check-in" : "Belum check-in",
        ])
      );
    }
  }
  if (empty) {
    styleBody(belum.addRow(["-", "-", "Semua mahasiswa sudah punya kelompok", "-"]));
  }

  const buffer = await wb.xlsx.writeBuffer();
  const first = targets[0];
  const filename =
    scope === "all"
      ? "rekap-kelompok-semua-matkul.xlsx"
      : `rekap-kelompok-${(first.code || first.name).replace(/[^a-zA-Z0-9-_]+/g, "_")}.xlsx`;

  return new NextResponse(Buffer.from(buffer as ArrayBuffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
