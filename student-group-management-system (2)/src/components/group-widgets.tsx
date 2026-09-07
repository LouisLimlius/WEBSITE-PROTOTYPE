"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Crown,
  Loader2,
  ArrowRight,
  LogIn,
  DoorOpen,
  Link2,
  Check,
  UserMinus,
  Trash2,
  Users,
} from "lucide-react";
import type { GroupVM, MemberVM } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Card, Chip, Avatar, AvatarStack, CapacityBar, StatusChip } from "@/components/ui";
import {
  useStudentSession,
  apiPost,
  apiDelete,
  getStudentSession,
} from "@/lib/student-session";

type MeData = {
  groups: { groupId: string; groupName: string; courseId: string }[];
  myVotes: { groupId: string; candidateId: string }[];
};

export const btnBase =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-ink px-3.5 py-2 text-sm font-bold shadow-hard-2 transition-all hover:enabled:translate-x-[1px] hover:enabled:translate-y-[1px] hover:enabled:shadow-none disabled:opacity-55";

export function useMyGroups() {
  const { student, ready } = useStudentSession();
  const [me, setMe] = useState<MeData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!student) {
      setMe(null);
      setLoaded(true);
      return;
    }
    let alive = true;
    fetch("/api/me", { headers: { "x-student-token": student.token } })
      .then(async (res) => {
        if (!alive) return;
        if (res.status === 401) {
          setMe(null);
        } else if (res.ok) {
          setMe(await res.json());
        }
        setLoaded(true);
      })
      .catch(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, [ready, student]);

  return { student, me: loaded ? me : null, ready: ready && loaded };
}

export function CopyLink({ path, label = "Salin tautan" }: { path: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(`${window.location.origin}${path}`);
          setCopied(true);
          toast.success("Tautan disalin — kirim ke teman sekelasmu!");
          setTimeout(() => setCopied(false), 1800);
        } catch {
          toast.error("Gagal menyalin tautan");
        }
      }}
      className={cn(btnBase, "bg-cream")}
    >
      {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      {copied ? "Tersalin!" : label}
    </button>
  );
}

/* ================= Grid kartu kelompok (halaman mata kuliah) ================= */

function JoinState({
  group,
  myGroupId,
  sessionReady,
  hasStudent,
  onJoin,
  busy,
}: {
  group: GroupVM;
  myGroupId: string | null;
  sessionReady: boolean;
  hasStudent: boolean;
  onJoin: () => void;
  busy: boolean;
}) {
  if (!sessionReady) {
    return <span className={cn(btnBase, "animate-pulse bg-smoke text-transparent")}>Memuat</span>;
  }
  if (!hasStudent) {
    return (
      <Link href="/gabung" className={cn(btnBase, "bg-cream")}>
        <LogIn className="h-4 w-4" /> Check-in untuk gabung
      </Link>
    );
  }
  if (myGroupId === group.id) {
    return (
      <Link href={`/kelompok/${group.id}`} className={cn(btnBase, "bg-gold")}>
        <Check className="h-4 w-4" /> Kelompokmu
      </Link>
    );
  }
  if (myGroupId) {
    return (
      <span className={cn(btnBase, "cursor-not-allowed bg-smoke text-ink/50")}>
        Sudah di kelompok lain
      </span>
    );
  }
  if (group.full) {
    return (
      <span className={cn(btnBase, "cursor-not-allowed bg-ink text-paper/50 shadow-none")}>
        Penuh
      </span>
    );
  }
  return (
    <button onClick={onJoin} disabled={busy} className={cn(btnBase, "bg-[#8BE8A5]")}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
      Gabung
    </button>
  );
}

export function GroupsGrid({
  courseId,
  groups,
  barColor,
}: {
  courseId: string;
  groups: GroupVM[];
  barColor: string;
}) {
  const router = useRouter();
  const { student, me, ready } = useMyGroups();
  const [busyId, setBusyId] = useState<string | null>(null);

  const myGroupId =
    me?.groups.find((g) => g.courseId === courseId)?.groupId ?? null;

  const join = useCallback(
    async (g: GroupVM) => {
      setBusyId(g.id);
      try {
        await apiPost(`/api/groups/${g.id}/join`, {}, student?.token);
        toast.success(`Kamu resmi anggota ${g.name}!`);
        router.refresh();
      } catch (e) {
        toast.error((e as Error).message);
        router.refresh();
      } finally {
        setBusyId(null);
      }
    },
    [router, student?.token]
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((g) => (
        <div key={g.id} className="flex flex-col rounded-2xl border-2 border-ink bg-cream p-4 shadow-hard transition-transform hover:-translate-y-0.5">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/kelompok/${g.id}`}
              className="font-display text-lg font-bold tracking-tight hover:underline"
            >
              {g.name}
            </Link>
            <StatusChip full={g.full} />
          </div>

          <div className="mt-1.5 min-h-6">
            {g.ketua ? (
              <Chip className="bg-gold">
                <Crown className="h-3 w-3" /> Ketua: {g.ketua.name.split(" ")[0]}
              </Chip>
            ) : g.full ? (
              <Chip className="bg-smoke text-ink/60">Voting ketua berlangsung</Chip>
            ) : null}
          </div>

          <div className="mt-3 flex items-center gap-3">
            {g.members.length > 0 ? (
              <AvatarStack names={g.members.map((m) => m.name)} />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-ink/35">
                <Users className="h-3.5 w-3.5 text-ink/35" />
              </span>
            )}
            <span className="text-sm font-bold tabular-nums">
              {g.memberCount}
              <span className="text-ink/40">/{g.maxMembers} anggota</span>
            </span>
          </div>

          <CapacityBar
            filled={g.memberCount}
            total={g.maxMembers}
            color={g.full ? "#8BE8A5" : barColor}
            className="mt-3"
          />

          <div className="mt-4 flex items-center justify-between gap-2 pt-1">
            <JoinState
              group={g}
              myGroupId={myGroupId}
              sessionReady={ready}
              hasStudent={!!student}
              onJoin={() => join(g)}
              busy={busyId === g.id}
            />
            <Link
              href={`/kelompok/${g.id}`}
              className="group/link inline-flex items-center gap-1 text-sm font-bold text-ink/60 hover:text-ink"
            >
              Detail
              <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================= Panel gabung/keluar (halaman kelompok) ================= */

export function JoinLeavePanel({ group }: { group: GroupVM }) {
  const router = useRouter();
  const { student, me, ready } = useMyGroups();
  const [busy, setBusy] = useState(false);

  const myGroupId = me?.groups.find((g) => g.courseId === group.courseId)?.groupId ?? null;
  const isMember = myGroupId === group.id;

  async function join() {
    setBusy(true);
    try {
      await apiPost(`/api/groups/${group.id}/join`, {}, student?.token);
      toast.success(`Kamu resmi anggota ${group.name}!`);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function leave() {
    if (!confirm("Yakin mau keluar dari kelompok ini? Suara voting-mu ikut terhapus.")) return;
    setBusy(true);
    try {
      await apiPost(`/api/groups/${group.id}/leave`, {}, student?.token);
      toast("Kamu keluar dari kelompok.");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <div className="h-11 animate-pulse rounded-xl bg-smoke/70" />;

  if (!student) {
    return (
      <div className="rounded-xl border-2 border-dashed border-ink/35 bg-paper/70 p-4 text-center">
        <p className="text-sm font-semibold text-ink/60">
          Check-in dulu dengan NIM & nama untuk gabung.
        </p>
        <Link href="/gabung" className={cn(btnBase, "mt-3 bg-gold")}>
          <LogIn className="h-4 w-4" /> Check-in Sekarang
        </Link>
      </div>
    );
  }

  if (isMember) {
    return (
      <div className="rounded-xl border-2 border-ink bg-[#E4F9EA] p-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <BadgeCheckIcon /> Kamu anggota kelompok ini
        </div>
        <button
          onClick={leave}
          disabled={busy}
          className={cn(btnBase, "mt-3 w-full bg-cream text-red-700")}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <DoorOpen className="h-4 w-4" />}
          Keluar dari Kelompok
        </button>
      </div>
    );
  }

  if (myGroupId) {
    return (
      <div className="rounded-xl border-2 border-dashed border-ink/35 bg-paper/70 p-4 text-center text-sm font-semibold text-ink/60">
        Kamu sudah tergabung di kelompok lain untuk mata kuliah ini.
      </div>
    );
  }

  if (group.full) {
    return (
      <div className="rounded-xl border-2 border-ink bg-smoke p-4 text-center text-sm font-bold text-ink/60">
        Kelompok ini sudah penuh ({group.maxMembers} orang). Coba kelompok lain ya.
      </div>
    );
  }

  return (
    <button
      onClick={join}
      disabled={busy}
      className={cn(btnBase, "w-full bg-[#8BE8A5] py-3 text-base shadow-hard")}
    >
      {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
      Gabung Kelompok Ini
    </button>
  );
}

function BadgeCheckIcon() {
  return <Check className="h-4 w-4 rounded-full bg-ink p-0.5 text-[#8BE8A5]" />;
}

/* ================= Daftar anggota + kick ================= */

export function MemberList({
  members,
  groupId,
  isDosen,
}: {
  members: MemberVM[];
  groupId: string;
  isDosen: boolean;
}) {
  const router = useRouter();
  const { student } = useStudentSession();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function kick(m: MemberVM) {
    if (!confirm(`Keluarkan ${m.name} dari kelompok? Suara terkait ikut dihapus.`)) return;
    setBusyId(m.id);
    try {
      await apiDelete(`/api/groups/${groupId}/members/${m.id}`);
      toast.success(`${m.name} dikeluarkan dari kelompok.`);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  if (members.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-ink/30 bg-paper/60 p-6 text-center text-sm text-ink/50">
        Belum ada anggota. Jadilah yang pertama!
      </div>
    );
  }

  return (
    <ul className="divide-y-2 divide-ink/8">
      {members.map((m, i) => (
        <li key={m.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <span className="w-5 text-xs font-bold tabular-nums text-ink/35">{i + 1}</span>
          <Avatar name={m.name} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={cn("truncate text-sm font-bold", m.isKetua && "text-ink")}>
                {m.name}
              </span>
              {m.isKetua && (
                <Chip className="bg-gold">
                  <Crown className="h-3 w-3" /> Ketua
                </Chip>
              )}
              {student?.id === m.id && <Chip className="bg-[#BBA8FF]">Kamu</Chip>}
            </div>
            <div className="text-xs text-ink/45">NIM {m.nim}</div>
          </div>
          {isDosen && (
            <button
              onClick={() => kick(m)}
              disabled={busyId === m.id}
              title="Keluarkan anggota"
              className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-ink bg-cream text-red-600 shadow-hard-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50"
            >
              {busyId === m.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserMinus className="h-4 w-4" />
              )}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

export function DeleteGroupButton({ groupId, name }: { groupId: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      onClick={async () => {
        if (!confirm(`Hapus ${name}? Semua anggota & suara voting ikut terhapus.`)) return;
        setBusy(true);
        const res = await fetch(`/api/groups/${groupId}`, { method: "DELETE" });
        if (res.ok) {
          toast.success("Kelompok dihapus.");
          router.back();
        } else {
          toast.error("Gagal menghapus kelompok.");
          setBusy(false);
        }
      }}
      disabled={busy}
      className={cn(btnBase, "bg-cream text-red-700")}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      Hapus
    </button>
  );
}
