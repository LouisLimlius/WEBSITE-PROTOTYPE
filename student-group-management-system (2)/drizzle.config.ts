import { defineConfig } from "drizzle-kit";

/**
 * URL database diambil dari file .env (DATABASE_URL).
 * - Lokal/preview: sudah terisi otomatis.
 * - Produksi (Neon/dll): isi .env dengan connection string milikmu,
 *   lalu jalankan `npx drizzle-kit push` untuk membuat tabel-tabel.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
});
