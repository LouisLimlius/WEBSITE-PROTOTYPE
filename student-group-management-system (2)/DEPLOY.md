# 🚀 Panduan Deploy: GitHub → Vercel → Neon (GRATIS, ±10 menit)

> Website ini butuh database karena datanya (NIM, kelompok, voting) harus
> tersimpan dan terlihat sama oleh semua mahasiswa. GitHub sendiri hanya
> menyimpan kode — jadi alurnya: **GitHub menyimpan kode → Vercel
> menjalankan websitenya → Neon menyimpan datanya.** Ketiganya gratis dan
> tidak ada server yang perlu kamu urus.

---

## Langkah 1 — Upload kode ke GitHub (5 menit)

1. Login ke https://github.com → klik **New repository** (tombol hijau /
   tombol `+` kanan atas).
2. Isi nama: `kelompokku` → pilih **Public** → **Create repository**.
3. Di halaman repo kosong yang muncul, klik tulisan
   **"uploading an existing file"**.
4. **Drag & drop SEMUA file & folder proyek ini** ke kotak upload
   (kecuali folder `node_modules` dan `.next` kalau terlihat).
   File `.env` akan otomatis tidak terupload kalau kamu pakai cara git —
   kalau drag-drop manual, **jangan sertakan `.env`.**
5. Klik **Commit changes**.

> Alternatif cara programmer: `git push` dari komputer. Tapi drag-drop
> di atas sudah cukup untuk pemula.

---

## Langkah 2 — Buat database gratis di Neon (3 menit)

1. Buka https://neon.tech → **Sign up** (bisa pakai akun GitHub).
2. Klik **Create project** → nama bebas (misal `kelompokku`) → **Create**.
3. Setelah jadi, akan tampil **Connection string** — contohnya:
   `postgresql://user:pass@ep-xyz-123.aws.neon.tech/neondb?sslmode=require`
4. **Salin dan simpan teks itu.** Ini "alamat gudang data" kamu.

---

## Langkah 3 — Deploy di Vercel (2 menit)

1. Buka https://vercel.com → **Sign up with GitHub**.
2. Klik **Add New → Project** → pilih repo `kelompokku` → **Import**.
3. Sebelum menekan Deploy, buka bagian **Environment Variables**,
   tambahkan 2 variabel ini:

   | Key            | Value                                          |
   | -------------- | ---------------------------------------------- |
   | `DATABASE_URL` | connection string Neon dari Langkah 2          |
   | `KOMTING_PIN`  | PIN rahasia mode komting, misal `komting123`   |

4. Klik **Deploy** → tunggu ±1 menit sampai muncul animasi selamat 🎉.
5. Klik **Visit / domain** → websitemu live dengan alamat
   `https://kelompokku-xxx.vercel.app`.

> Sampai sini website sudah bisa dibuka, tapi database-nya masih kosong
> tanpa tabel — lanjut ke Langkah 4 (sekali saja).

---

## Langkah 4 — Buat tabel-tabel di database Neon (2 menit, sekali saja)

Di komputermu (folder proyek ini):

1. Buka file `.env`, ganti isinya menjadi connection string Neon:

   ```
   DATABASE_URL=<tempel connection string Neon dari Langkah 2>
   ```

2. Jalankan:

   ```bash
   npx drizzle-kit push
   ```

   Kalau muncul `[✓] Changes applied` — selesai! Semua tabel sudah dibuat.

3. Buka lagi websitemu → di Dashboard klik **"Muat Data Contoh"** kalau
   mau isi data dummy, atau langsung **Login Mode Komting** dan buat
   mata kuliah sendiri.

> Punya teman yang komputernya tidak ada Node.js? Minta teman itu tidak
> perlu melakukan apa pun — langkah 4 cukup dilakukan SATU ORANG sekali.

---

## Setelah live — cara update website

- Edit kode di GitHub (tombol pensil ✏️ di file mana pun) → **Commit** →
  Vercel otomatis mendeteksi perubahan dan deploy ulang dalam ±1 menit.
  Tidak ada yang perlu diurus lagi.
- Mau kasih ke teman satu angkatan? Tinggal share link Vercel-nya.

## Gratis? Perlu kartu kredit?

| Layanan | Gratis? | Kartu kredit? | Batas |
| ------- | ------- | ------------- | ----- |
| GitHub  | ✅      | Tidak         | Cukup untuk kode |
| Vercel  | ✅ (Hobby) | Tidak      | Cukup untuk trafik sekelas/angkatan |
| Neon    | ✅ (Free)  | Tidak      | 0,5 GB — muat ratusan ribu baris data |

## Masalah umum

- **Error "DATABASE_URL is required"** → Environment variable di Vercel
  belum diisi / salah ketik. Cek Settings → Environment Variables.
- **Halaman error membaca tabel** → Langkah 4 (drizzle-kit push) belum
  dijalankan ke database Neon.
- **Lupa PIN komting** → ganti nilai `KOMTING_PIN` di Vercel →
  Settings → Environment Variables, lalu klik "Redeploy".
