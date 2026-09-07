"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import {
  Users,
  LayoutDashboard,
  UserPlus,
  Search,
  Lock,
  LogOut,
  GraduationCap,
  Menu,
  X,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/gabung", label: "Gabung", icon: UserPlus },
  { href: "/belum-kelompok", label: "Belum Punya Kelompok", icon: Search },
];

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      gap={10}
      toastOptions={{
        style: {
          background: "#fffdf7",
          border: "2px solid #181510",
          boxShadow: "4px 4px 0 #181510",
          borderRadius: "14px",
          color: "#181510",
          fontWeight: 500,
        },
      }}
    />
  );
}

function DosenButton({ initialDosen }: { initialDosen: boolean }) {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function login() {
    if (!pin.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/dosen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "PIN salah");
        return;
      }
      toast.success("Mode Komting aktif — kamu bisa mengelola semuanya");
      setOpen(false);
      setPin("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/dosen", { method: "DELETE" });
    toast("Mode Komting dinonaktifkan");
    router.refresh();
  }

  if (initialDosen) {
    return (
      <button
        onClick={logout}
        title="Keluar mode komting"
        className="flex items-center gap-1.5 rounded-xl border-2 border-ink bg-gold px-3 py-1.5 text-xs font-bold shadow-hard-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
      >
        <GraduationCap className="h-4 w-4" />
        <span className="hidden sm:inline">Komting Aktif</span>
        <LogOut className="h-3.5 w-3.5 opacity-60" />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl border-2 border-ink bg-cream px-3 py-1.5 text-xs font-bold shadow-hard-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
      >
        <Lock className="h-3.5 w-3.5" />
        Mode Komting
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border-2 border-ink bg-cream p-6 shadow-hard-8 animate-float-in"
          >
            <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink bg-gold shadow-hard-2">
              <KeyRound className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-display text-xl font-bold tracking-tight">Login Mode Komting</h3>
            <p className="mt-1 text-sm text-ink/60">
              Masukkan PIN komting untuk mengelola mata kuliah, kuota kelompok, dan anggota.
            </p>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="PIN komting"
              autoFocus
              className="mt-4 w-full rounded-xl border-2 border-ink bg-paper px-4 py-2.5 text-sm font-semibold outline-none placeholder:text-ink/40 focus:shadow-hard-2"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border-2 border-ink bg-cream px-4 py-2.5 text-sm font-bold transition-colors hover:bg-smoke"
              >
                Batal
              </button>
              <button
                onClick={login}
                disabled={busy}
                className="flex-1 rounded-xl border-2 border-ink bg-gold px-4 py-2.5 text-sm font-bold shadow-hard-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50"
              >
                {busy ? "Memeriksa..." : "Masuk"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function TopNav({ initialDosen }: { initialDosen: boolean }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    setMenu(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink bg-ink text-paper shadow-hard-2 transition-transform group-hover:-rotate-6">
            <Users className="h-4.5 w-4.5" strokeWidth={2.4} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Kelompok<span className="text-ink/40">Ku</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-sm font-semibold transition-all",
                  active
                    ? "border-ink bg-ink text-paper shadow-hard-2"
                    : "border-transparent text-ink/60 hover:border-ink hover:bg-cream hover:text-ink"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <DosenButton initialDosen={initialDosen} />
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink bg-cream shadow-hard-2 md:hidden"
            onClick={() => setMenu(!menu)}
            aria-label="Menu"
          >
            {menu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {menu && (
        <nav className="border-t-2 border-ink bg-paper px-4 pb-4 pt-2 md:hidden animate-float-in">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "mb-1 flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold",
                  active ? "border-ink bg-ink text-paper" : "border-transparent text-ink/70"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t-2 border-ink bg-cream/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center sm:px-6">
        <div className="flex items-center gap-2 font-display font-bold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-ink bg-gold">
            <GraduationCap className="h-4 w-4" />
          </span>
          KelompokKu
        </div>
        <p className="text-xs text-ink/50">
          Bentuk kelompok, penuhi kuota, pilih ketua — semua tanpa drama. Data tersimpan aman di server kampus.
        </p>
      </div>
    </footer>
  );
}
