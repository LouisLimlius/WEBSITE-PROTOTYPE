# 📖 Panduan Membaca Kode KelompokKu (untuk pemula)

## Bahasanya apa sih?

Website ini **seluruhnya ditulis pakai JavaScript** — tidak ada bahasa lain.
File-nya berakhiran `.ts` / `.tsx` karena memakai **TypeScript**,
yang artinya *JavaScript biasa + catatan tipe data*.

Contoh — ini JavaScript biasa:

```js
function sapa(nama) {
  return "Halo " + nama;
}
```

Ini versi TypeScript (yang dipakai proyek ini):

```ts
function sapa(nama: string): string {
  return "Halo " + nama;
}
```

BEDANYA cuma tambahan `: string`. Itu cuma "label" buat bantuin programmer
menghindari salah ketik — kalau labelnya dihapus, kodenya tetap jalan biasa.
Jadi jangan takut, itu tetap JavaScript.

## Kenapa bukan Python?

Karena justru cara sekarang **lebih gampang**:

| Cara sekarang (JavaScript)      | Kalau pakai Python                  |
| ------------------------------- | ----------------------------------- |
| 1 bahasa untuk semua            | 2 bahasa (Python + JavaScript)      |
| 1 program/server                | 2 server terpisah yang harus sinkron |
| Frontend & backend bisa saling pakai fungsi | Harus bikin API jembatan dua kali |

Website butuh JavaScript di browser (tidak bisa diganti Python),
jadi kalau backend-nya pakai Python, kamu tetap harus ngerti JavaScript —
plus Python pula. Ribet kan?

## Analogi struktur proyek = sebuah rumah

```
src/
├── app/                  🏠 RUANGAN-RUANGAN (halaman yang kamu buka)
│   ├── page.tsx              → Dashboard (halaman utama)
│   ├── gabung/page.tsx       → Halaman check-in mahasiswa
│   ├── belum-kelompok/       → Halaman daftar yang belum dapat kelompok
│   ├── matakuliah/[id]/      → Halaman detail 1 mata kuliah
│   ├── kelompok/[id]/        → Halaman detail 1 kelompok + voting
│   ├── globals.css           → Pewarnaan & gaya tampilan (mirip CSS biasa)
│   └── api/              🛎️ PELAYAN (jembatan browser ↔ database)
│       ├── students/route.ts     → daftar/check-in mahasiswa
│       ├── courses/              → buat & hapus mata kuliah
│       ├── groups/[id]/          → gabung, keluar, voting, kick
│       ├── export/[scope]/       → bikin file Excel
│       └── dosen/route.ts        → login Mode Komting
│
├── components/           🪑 PERABOT (benda-benda di tiap ruangan)
│   ├── ui.tsx                → kartu, tombol, chip, avatar, bar kuota
│   ├── app-chrome.tsx        → navbar atas + dialog login Komting
│   ├── student-widgets.tsx   → form check-in NIM + "Kelompok Saya"
│   ├── group-widgets.tsx     → kartu kelompok + tombol gabung/keluar
│   ├── vote-panel.tsx        → panel voting ketua
│   ├── dosen-tools.tsx       → tombol-tombol khusus Komting
│   └── unassigned-browser.tsx→ tabel "belum punya kelompok"
│
├── lib/                  🧰 KOTAK PERKAKAS (fungsi bantu)
│   ├── data.ts               → semua pertanyaan ke database (SELECT ...)
│   ├── auth.ts               → cek PIN komting & token mahasiswa
│   ├── student-session.ts    → simpan sesi di browser (localStorage)
│   └── utils.ts              → warna, inisial nama, hitung ketua menang
│
└── db/                   🗄️ GUDANG DATA
    ├── schema.ts             → denah tabel: courses, groups, students,
    │                           memberships (anggota), votes (suara)
    └── index.ts              → "kunci gudang": koneksi ke PostgreSQL
```

## Cara mulai belajar bacanya (15 menit)

1. Buka `src/db/schema.ts` → lihat 5 tabel datanya. 90% logika aplikasi
   cuma "tambah/baca/hapus data di 5 tabel ini".
2. Buka `src/app/page.tsx` → ini halaman utama. Bandingkan kodenya
   dengan tampilan di browser, bagian `<h1>`, `<Card>` langsung kelihatan.
3. Buka `src/app/api/groups/[id]/join/route.ts` → contoh paling nyata
   cara kerja tombol "Gabung": validasi → cek kuota → simpan.
4. Kalau ketemu `use client` di baris pertama file = file itu jalan di
   browser kamu. Tanpa itu = jalan di server.

## Perintah sehari-hari

```bash
npm run dev      # jalankan saat ngoding (auto-refresh)
npm run build    # bikin versi final siap tayang
npm run start    # jalankan versi final
```
