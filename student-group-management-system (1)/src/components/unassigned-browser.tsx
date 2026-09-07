"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  ClipboardCopy,
  Check,
  UserPlus2,
  Loader2,
  ArrowRight,
  Shuffle,
  MailQuestion,
  Trash2,
} from "lucide-react";
import type { StudentVM } from "@/lib/data";
import { cn, courseColor } from "@/lib/utils";
import { Card, Chip, Avatar } from "@/components/ui";
import { btnBase } from "@/components/group-widgets";
import { apiPost, apiDelete } from "@/lib/student-session";

export type UnassignedTab = {
  id: string;
  name: string;
  code: string;
  colorIndex: number;
  list: StudentVM[];
};

function BulkAdd({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const data = await apiPost("/api/students/bulk", { text });
      toast.success(
        `${data.added} mahasiswa ditambahkan` +
          (data.existed ? ` · ${data.existed} sudah ada` : "") +
          (data.skipped ? ` · ${data.skipped} baris dilewati` : "")
      );
      setText("");
      onDone();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink bg-[#BBA8FF] shadow-hard-2">
          <UserPlus2 className="h-4 w-4" />
        </span>
        <h3 className="font-display text-base font-bold tracking-tight">Impor Daftar Kelas</h3>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink/55">
        Tempel daftar dari spreadsheet/presensi. Satu baris satu mahasiswa, format{" "}
        <span className="font-bold">NIM Nama</span> atau <span className="font-bold">NIM, Nama</span>.
        Mereka langsung muncul di daftar belum-punya-kelompok.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder={"2355201017 Hamdan Al-Farizi\n2355201018, Naura Safitri\n..."}
        className="mt-3 w-full rounded-xl border-2 border-ink bg-paper px-3.5 py-2.5 font-mono text-xs outline-none focus:shadow-hard-2"
      />
      <button
        onClick={submit}
        disabled={busy || !text.trim()}
        className={cn(btnBase, "mt-3 w-full bg-[#BBA8FF]")}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus2 className="h-4 w-4" />}
        Tambahkan ke Daftar
      </button>
    </Card>
  );
}

export function UnassignedBrowser({
  tabs,
  isDosen,
}: {
  tabs: UnassignedTab[];
  isDosen: boolean;
}) {
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const current = tabs[Math.min(active, tabs.length - 1)];

  async function removeStudent(s: StudentVM) {
    if (
      !confirm(
        `Hapus ${s.name} (${s.nim}) dari sistem? Semua keanggotaan kelompok & suara voting-nya ikut terhapus permanen.`
      )
    )
      return;
    setDeletingId(s.id);
    try {
      await apiDelete(`/api/students/${s.id}`);
      toast.success(`${s.name} dihapus dari sistem.`);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    if (!current) return [];
    const q = query.trim().toLowerCase();
    if (!q) return current.list;
    return current.list.filter(
      (s) => s.name.toLowerCase().includes(q) || s.nim.toLowerCase().includes(q)
    );
  }, [current, query]);

  async function copyAll() {
    if (!current || current.list.length === 0) return;
    const text = current.list.map((s) => `${s.nim}\t${s.name}`).join("\n");
    try {
      await navigator.clipboard.writeText(
        `Belum punya kelompok — ${current.name} (${current.list.length} mahasiswa)\n\n${text}`
      );
      setCopied(true);
      toast.success("Daftar disalin — tinggal tempel ke grup kelas/Excel.");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Gagal menyalin.");
    }
  }

  if (tabs.length === 0) {
    return (
      <Card className="p-10 text-center">
        <MailQuestion className="mx-auto h-8 w-8 text-ink/35" />
        <p className="mt-3 font-display text-lg font-bold">Belum ada mata kuliah</p>
        <p className="mt-1 text-sm text-ink/55">
          Komting perlu membuat mata kuliah dulu di Dashboard.
        </p>
        {isDosen && (
          <div className="mx-auto mt-6 max-w-sm text-left">
            <BulkAdd onDone={() => router.refresh()} />
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        {/* Tab mata kuliah */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((t, i) => {
            const c = courseColor(t.colorIndex);
            const isActive = i === active;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActive(i);
                  setQuery("");
                }}
                className={cn(
                  "flex items-center gap-2 rounded-xl border-2 border-ink px-3.5 py-2 text-sm font-bold transition-all",
                  isActive ? "shadow-hard-2 translate-x-[1px] -translate-y-0.5" : "opacity-70 hover:opacity-100"
                )}
                style={{ backgroundColor: isActive ? c.bg : "#fffdf7" }}
              >
                {t.code || t.name}
                <span className="rounded-full border-2 border-ink bg-ink px-1.5 text-[10px] font-bold text-paper tabular-nums">
                  {t.list.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama atau NIM..."
              className="w-full rounded-xl border-2 border-ink bg-cream py-2.5 pl-10 pr-3 text-sm font-semibold outline-none placeholder:text-ink/35 focus:shadow-hard-2"
            />
          </div>
          <button onClick={copyAll} className={cn(btnBase, "bg-cream")}>
            {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
            {copied ? "Tersalin!" : "Salin Daftar"}
          </button>
        </div>

        {/* Daftar */}
        <Card className="mt-4 overflow-hidden p-0">
          <div className="flex items-center justify-between gap-2 border-b-2 border-ink bg-smoke/60 px-5 py-3">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/55">
              {current.name}
            </span>
            <span className="text-xs font-bold tabular-nums text-ink/55">
              {filtered.length} dari {current.list.length} mahasiswa
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-10 text-center">
              <Check className="mx-auto h-7 w-7 text-emerald-600" />
              <p className="mt-2 text-sm font-bold text-ink/65">
                {current.list.length === 0
                  ? "Semua mahasiswa sudah dapat kelompok di mata kuliah ini."
                  : "Tidak ada yang cocok dengan pencarianmu."}
              </p>
            </div>
          ) : (
            <ul className="max-h-[560px] divide-y-2 divide-ink/8 overflow-y-auto px-5">
              {filtered.map((s, i) => (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <span className="w-5 shrink-0 text-xs font-bold tabular-nums text-ink/35">
                    {i + 1}
                  </span>
                  <Avatar name={s.name} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{s.name}</div>
                    <div className="text-xs text-ink/45">NIM {s.nim}</div>
                  </div>
                  {s.checkedIn ? (
                    <Chip className="bg-[#8BE8A5]">Aktif</Chip>
                  ) : (
                    <Chip className="bg-smoke text-ink/50">Belum check-in</Chip>
                  )}
                  {isDosen && (
                    <button
                      onClick={() => removeStudent(s)}
                      disabled={deletingId === s.id}
                      title="Hapus mahasiswa ini dari sistem"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-ink bg-cream text-red-600 shadow-hard-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50"
                    >
                      {deletingId === s.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Panel samping */}
      <div className="space-y-4">
        {isDosen && <BulkAdd onDone={() => router.refresh()} />}
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink bg-gold shadow-hard-2">
              <Shuffle className="h-4 w-4" />
            </span>
            <h3 className="font-display text-base font-bold tracking-tight">Trik Cepat</h3>
          </div>
          <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-ink/60">
            <li className="flex gap-2">
              <span className="font-bold text-ink">1.</span>
              Komting bisa tekan <span className="font-bold">Acak &amp; Isi Otomatis</span> di halaman
              mata kuliah untuk mendistribusikan semua nama di daftar ini.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-ink">2.</span>
              Bagikan tautan mata kuliah ke grup kelas supaya mahasiswa gabung sendiri.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-ink">3.</span>
              Tombol Salin Daftar cocok untuk broadcast WhatsApp ke yang belum dapat kelompok.
            </li>
          </ul>
          {current && (
            <Link
              href={`/matakuliah/${current.id}`}
              className={cn(btnBase, "mt-4 w-full bg-ink text-paper")}
            >
              Buka Mata Kuliah <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </Card>
      </div>
    </div>
  );
}
