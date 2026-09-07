# 🎓 KelompokKu

Website pembentukan kelompok kuliah: komting set kuota per mata kuliah,
mahasiswa gabung pakai NIM + nama, kelompok terkunci otomatis saat penuh,
semua anggota voting ketua, dan hasilnya bisa di-export ke Excel.

## Fitur

- 👥 Kelompok per mata kuliah dengan kuota bebas (misal Agama 3 orang)
- 🪪 Mahasiswa gabung cukup check-in NIM + nama (tanpa akun)
- 🔒 Kelompok otomatis terkunci ketika kuota penuh
- 🗳️ Voting ketua dibuka saat penuh — ganti pilihan menimpa suara lama,
  ketua sah setelah mayoritas mutlak
- 📋 Halaman "Belum Punya Kelompok" + impor daftar kelas massal
- 🎲 Acak & isi otomatis (distribusi mahasiswa 1 klik)
- 📊 Export rekap ke Excel (.xlsx) per matkul / semua
- 🎓 Mode Komting (PIN) untuk semua aksi pengelolaan

## Pakai di mana?

📖 **Panduan deploy gratis selangkah-demi-selangkah ada di [DEPLOY.md](./DEPLOY.md)**
(GitHub ➜ Vercel ➜ Neon — ±10 menit, tanpa server sendiri, gratis).

## Jalankan di komputer sendiri

```bash
npm install        # sekali saja
npm run dev        # buka http://localhost:3000
```

Butuh PostgreSQL (lokal/cloud). Salin koneksinya ke `.env`:

```
DATABASE_URL=postgresql://user:pass@host:5432/db
KOMTING_PIN=komting123   # opsional, PIN Mode Komting
```

lalu buat tabelnya:

```bash
npx drizzle-kit push
```

## Teknologi

Next.js (App Router) · React · TypeScript · Drizzle ORM · PostgreSQL ·
Tailwind CSS · ExcelJS · Framer Motion · Sonner

📚 Bingung membaca kodenya? Buka [PANDUAN.md](./PANDUAN.md) — penjelasan
struktur proyek dengan bahasa awam.
