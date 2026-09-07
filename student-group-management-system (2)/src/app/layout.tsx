import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { TopNav, Footer, AppToaster } from "@/components/app-chrome";
import { isDosen } from "@/lib/auth";

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sg",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KelompokKu — Kelola Kelompok Kuliah Anti Ribet",
  description:
    "Platform pembentukan kelompok kuliah: kuota per mata kuliah, gabung dengan NIM, voting ketua otomatis, dan ekspor ke Excel.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const dosen = await isDosen();
  return (
    <html lang="id" className={`${space.variable} ${inter.variable}`}>
      <body className="bg-paper bg-dots font-sans text-ink antialiased">
        <TopNav initialDosen={dosen} />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
        <AppToaster />
      </body>
    </html>
  );
}
