"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IdCard,
  LogOut,
  Loader2,
  Users,
  ArrowRight,
  RefreshCw,
  BadgeCheck,
} from "lucide-react";
import { Card, Chip, Avatar, CapacityBar } from "@/components/ui";
import {
  useStudentSession,
  saveStudentSession,
  clearStudentSession,
  getStudentSession,
  type StudentSession,
} from "@/lib/student-session";

type MyGroup = {
  groupId: string;
  groupName: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  maxMembers: number;
  memberCount: number;
  joinedAt: string;
};

export function CheckInForm() {
  const [nim, setNim] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim, name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Gagal check-in");
        return;
      }
      saveStudentSession(data.student);
      toast.success(`Halo, ${data.student.name.split(" ")[0]}! Kamu sudah check-in.`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/60">
          NIM <span className="text-ink/40">(Nomor Induk Mahasiswa)</span>
        </label>
        <input
          value={nim}
          onChange={(e) => setNim(e.target.value)}
          placeholder="mis. 2355201018"
          required
          minLength={3}
          className="w-full rounded-xl border-2 border-ink bg-paper px-4 py-3 font-semibold tracking-wide outline-none transition-shadow placeholder:font-normal placeholder:text-ink/35 focus:shadow-hard-2"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/60">
          Nama Lengkap
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="mis. Tiara Anindya"
          required
          minLength={3}
          className="w-full rounded-xl border-2 border-ink bg-paper px-4 py-3 font-semibold outline-none transition-shadow placeholder:font-normal placeholder:text-ink/35 focus:shadow-hard-2"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-ink bg-gold px-4 py-3 font-display text-base font-bold shadow-hard transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-2 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <IdCard className="h-5 w-5" />}
        {busy ? "Memproses..." : "Check-in Sekarang"}
      </button>
      <p className="text-center text-xs leading-relaxed text-ink/45">
        Identitas tersimpan di browser ini saja. Kuota & suara voting dihitung dari NIM kamu.
      </p>
    </form>
  );
}

export function MyGroups({ student }: { student: StudentSession }) {
  const [groups, setGroups] = useState<MyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/me", {
        headers: { "x-student-token": student.token },
      });
      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Sesi kedaluwarsa — silakan check-in ulang.");
          clearStudentSession();
        }
        setGroups([]);
        return;
      }
      const data = await res.json();
      setGroups(data.groups ?? []);
    } finally {
      setLoading(false);
    }
  }, [student.token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold tracking-tight">Kelompok Saya</h3>
        <button
          onClick={() => {
            load();
            router.refresh();
          }}
          className="flex items-center gap-1 rounded-lg border-2 border-ink bg-cream px-2.5 py-1.5 text-xs font-bold shadow-hard-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
        >
          <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
          Segarkan
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border-2 border-ink/10 bg-smoke/60" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-ink/30 bg-paper/60 p-6 text-center">
          <Users className="mx-auto h-6 w-6 text-ink/35" />
          <p className="mt-2 text-sm font-semibold text-ink/60">Belum ada kelompok.</p>
          <p className="mt-0.5 text-xs text-ink/45">
            Buka halaman mata kuliah lalu tekan tombol Gabung.
          </p>
          <Link
            href="/"
            className="mt-3 inline-flex items-center gap-1 rounded-lg border-2 border-ink bg-ink px-3 py-1.5 text-xs font-bold text-paper shadow-hard-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
          >
            Lihat Mata Kuliah <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {groups.map((g) => (
            <li key={g.groupId}>
              <Link
                href={`/kelompok/${g.groupId}`}
                className="group block rounded-xl border-2 border-ink bg-paper p-3.5 shadow-hard-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Chip className="bg-smoke">{g.courseCode || "MK"}</Chip>
                      <span className="truncate text-sm font-bold">{g.groupName}</span>
                      {g.memberCount >= g.maxMembers && <Chip className="bg-ink text-paper">Penuh</Chip>}
                    </div>
                    <div className="mt-1 truncate text-xs text-ink/50">{g.courseName}</div>
                  </div>
                  <div className="flex w-full items-center gap-2 sm:w-40">
                    <CapacityBar
                      filled={g.memberCount}
                      total={g.maxMembers}
                      color={g.memberCount >= g.maxMembers ? "#8BE8A5" : "#FFC94D"}
                    />
                    <span className="shrink-0 text-xs font-bold tabular-nums">
                      {g.memberCount}/{g.maxMembers}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function GabungContent() {
  const { student, ready } = useStudentSession();
  const router = useRouter();

  if (!ready) {
    return (
      <div className="space-y-3">
        <div className="h-12 animate-pulse rounded-xl bg-smoke/70" />
        <div className="h-12 animate-pulse rounded-xl bg-smoke/70" />
        <div className="h-12 animate-pulse rounded-xl bg-smoke/70" />
      </div>
    );
  }

  if (!student) return <CheckInForm />;

  return (
    <div className="space-y-5">
      <Card className="flex items-center gap-3 p-4">
        <Avatar name={student.name} className="h-11 w-11 text-sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold">{student.name}</span>
            <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          </div>
          <div className="mt-0.5 text-xs font-semibold text-ink/50">NIM {student.nim}</div>
        </div>
        <button
          onClick={() => {
            clearStudentSession();
            toast("Sesi dihapus dari browser ini.");
            router.refresh();
          }}
          title="Bukan kamu? Ganti akun"
          className="flex items-center gap-1 rounded-lg border-2 border-ink bg-cream px-2.5 py-1.5 text-xs font-bold shadow-hard-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
        >
          <LogOut className="h-3.5 w-3.5" /> Ganti
        </button>
      </Card>
      <MyGroups student={student} />
    </div>
  );
}

/** Hook ringan untuk komponen lain yang butuh sesi saat ini. */
export function useSessionToken() {
  return getStudentSession()?.token ?? null;
}
