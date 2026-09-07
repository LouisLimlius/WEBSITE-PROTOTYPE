"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Minus,
  Loader2,
  Shuffle,
  FileSpreadsheet,
  Trash2,
  Users,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { btnBase } from "@/components/group-widgets";
import { apiPost } from "@/lib/student-session";

/* =============== Form buat mata kuliah (dashboard) =============== */

export function CreateCoursePanel() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [maxMembers, setMaxMembers] = useState(4);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiPost("/api/courses", { name, code, lecturer, maxMembers });
      toast.success(`Mata kuliah "${name}" dibuat dengan kuota ${maxMembers} orang/kelompok.`);
      setName("");
      setCode("");
      setLecturer("");
      setMaxMembers(4);
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen(!open)}
        className={cn(btnBase, "bg-ink text-paper shadow-hard hover:enabled:shadow-hard-2")}
      >
        {open ? <ChevronDown className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        Mata Kuliah Baru
      </button>

      {open && (
        <form
          onSubmit={submit}
          className="mt-4 animate-float-in rounded-2xl border-2 border-ink bg-cream p-5 shadow-hard"
        >
          <h3 className="font-display text-lg font-bold tracking-tight">Mata Kuliah Baru</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink/60">
                Nama Mata Kuliah *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="mis. Pendidikan Agama"
                required
                className="w-full rounded-xl border-2 border-ink bg-paper px-3.5 py-2.5 text-sm font-semibold outline-none focus:shadow-hard-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink/60">
                Kode
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="PAI-101"
                className="w-full rounded-xl border-2 border-ink bg-paper px-3.5 py-2.5 text-sm font-semibold outline-none focus:shadow-hard-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink/60">
                Dosen Pengampu
              </label>
              <input
                value={lecturer}
                onChange={(e) => setLecturer(e.target.value)}
                placeholder="Dr. ..."
                className="w-full rounded-xl border-2 border-ink bg-paper px-3.5 py-2.5 text-sm font-semibold outline-none focus:shadow-hard-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink/60">
                Kuota Anggota per Kelompok *
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMaxMembers((v) => Math.max(2, v - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink bg-cream shadow-hard-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="flex h-11 min-w-28 items-center justify-center gap-1.5 rounded-xl border-2 border-ink bg-gold px-4 shadow-hard-2">
                  <Users className="h-4 w-4" />
                  <span className="font-display text-xl font-bold tabular-nums">{maxMembers}</span>
                  <span className="text-xs font-bold text-ink/60">orang</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMaxMembers((v) => Math.min(20, v + 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink bg-cream shadow-hard-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <span className="hidden text-xs text-ink/45 sm:block">
                  Misal Agama cukup 3 orang — set 3. Kelompok otomatis terkunci saat penuh.
                </span>
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={busy}
            className={cn(btnBase, "mt-4 w-full bg-gold py-3 shadow-hard")}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Simpan Mata Kuliah
          </button>
        </form>
      )}
    </div>
  );
}

/* =============== Toolbar halaman mata kuliah (dosen) =============== */

export function CourseToolbar({
  courseId,
  name,
}: {
  courseId: string;
  name: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function addGroup() {
    setBusy("group");
    try {
      await apiPost(`/api/courses/${courseId}/groups`, {});
      toast.success("Kelompok baru dibuat.");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function autofill() {
    if (
      !confirm(
        "Distribusi acak: isi slot kosong kelompok yang ada, lalu bentuk kelompok baru untuk sisa mahasiswa. Lanjutkan?"
      )
    )
      return;
    setBusy("auto");
    try {
      const data = await apiPost(`/api/courses/${courseId}/autofill`, {});
      toast.success(
        `${data.assigned} mahasiswa terdistribusi${data.createdGroups ? ` · ${data.createdGroups} kelompok baru dibuat` : ""}.`
      );
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function removeCourse() {
    if (!confirm(`Hapus mata kuliah "${name}" beserta seluruh kelompok & datanya?`)) return;
    setBusy("del");
    const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Mata kuliah dihapus.");
      router.push("/");
      router.refresh();
    } else {
      toast.error("Gagal menghapus.");
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={addGroup} disabled={!!busy} className={cn(btnBase, "bg-ink text-paper")}>
        {busy === "group" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Tambah Kelompok
      </button>
      <button onClick={autofill} disabled={!!busy} className={cn(btnBase, "bg-[#BBA8FF]")}>
        {busy === "auto" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shuffle className="h-4 w-4" />}
        Acak &amp; Isi Otomatis
      </button>
      <a href={`/api/export/${courseId}`} className={cn(btnBase, "bg-[#8BE8A5]")}>
        <FileSpreadsheet className="h-4 w-4" /> Export Excel
      </a>
      <button onClick={removeCourse} disabled={!!busy} className={cn(btnBase, "bg-cream text-red-700")}>
        {busy === "del" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        Hapus MK
      </button>
    </div>
  );
}

export function DeleteCourseIcon({ courseId, name }: { courseId: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm(`Hapus mata kuliah "${name}" beserta seluruh kelompoknya?`)) return;
        setBusy(true);
        const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
        if (res.ok) {
          toast.success("Mata kuliah dihapus.");
          router.refresh();
        } else {
          toast.error("Gagal menghapus.");
          setBusy(false);
        }
      }}
      disabled={busy}
      title="Hapus mata kuliah"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-ink bg-cream text-red-600 shadow-hard-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}

/* =============== Tombol muat data contoh =============== */

export function SeedButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        setBusy(true);
        try {
          const data = await apiPost("/api/seed", {});
          void data;
          toast.success("Data contoh dimuat — 3 mata kuliah, 16 mahasiswa, 5 kelompok.");
          router.refresh();
        } catch (e) {
          toast.error((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
      disabled={busy}
      className={cn(btnBase, "bg-gold px-5 py-3 text-base shadow-hard")}
    >
      {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
      Muat Data Contoh
    </button>
  );
}
