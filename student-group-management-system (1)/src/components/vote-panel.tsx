"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Crown, Lock, Loader2, Vote, Undo2, Info } from "lucide-react";
import type { GroupVM } from "@/lib/data";
import { cn, avatarColor } from "@/lib/utils";
import { Card, Chip, Avatar } from "@/components/ui";
import { AnimatedBar } from "@/components/motion";
import { btnBase, useMyGroups, CopyLink } from "@/components/group-widgets";
import { apiPost, apiDelete } from "@/lib/student-session";

export function VotePanel({ group }: { group: GroupVM }) {
  const router = useRouter();
  const { student, me, ready } = useMyGroups();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyUndo, setBusyUndo] = useState(false);

  const isMember = !!me?.groups.some((g) => g.groupId === group.id);
  const myVote = me?.myVotes.find((v) => v.groupId === group.id)?.candidateId ?? null;
  const majorityNeeded = Math.floor(group.maxMembers / 2) + 1;

  const ranked = [...group.members].sort(
    (a, b) => b.voteCount - a.voteCount || a.name.localeCompare(b.name, "id")
  );

  async function vote(candidateId: string, candidateName: string) {
    setBusyId(candidateId);
    const wasChange = myVote !== null && myVote !== candidateId;
    try {
      await apiPost(`/api/groups/${group.id}/vote`, { candidateId }, student?.token);
      toast.success(
        wasChange
          ? `Suara dipindahkan ke ${candidateName}. Suara lamamu otomatis tertimpa.`
          : `Suaramu untuk ${candidateName} tersimpan.`
      );
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function unvote() {
    setBusyUndo(true);
    try {
      await apiDelete(`/api/groups/${group.id}/vote`, student?.token);
      toast("Suaranya ditarik kembali. Silakan pilih calon lain.");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyUndo(false);
    }
  }

  /* ------------- Kelompok belum penuh → voting terkunci ------------- */
  if (!group.full) {
    return (
      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl font-bold tracking-tight">Pemilihan Ketua</h2>
          <Chip className="bg-smoke text-ink/55">
            <Lock className="h-3 w-3" /> Terkunci
          </Chip>
        </div>
        <div className="mt-4 rounded-xl border-2 border-dashed border-ink/30 bg-paper/60 p-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-ink bg-smoke shadow-hard-2">
            <Lock className="h-6 w-6 text-ink/50" />
          </span>
          <p className="mt-3 text-sm font-bold text-ink/70">
            Voting dibuka otomatis begitu kuota penuh ({group.memberCount}/{group.maxMembers}).
          </p>
          <p className="mt-1 text-xs text-ink/50">
            Ajak temanmu gabung lewat tautan kelompok — makin cepat penuh, makin cepat pilih ketua.
          </p>
          <div className="mt-4 flex justify-center">
            <CopyLink path={`/kelompok/${group.id}`} label="Salin tautan kelompok" />
          </div>
        </div>
      </Card>
    );
  }

  /* ---------------------- Kelompok penuh → voting ---------------------- */
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b-2 border-ink bg-[#EFE9FF] px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-bold tracking-tight">Pemilihan Ketua</h2>
            <Chip className="bg-cream">Terbuka</Chip>
          </div>
          <span className="text-xs font-bold text-ink/55">
            {group.totalVotes}/{group.maxMembers} suara masuk · mayoritas butuh ≥{majorityNeeded}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Banner hasil */}
        {group.ketua ? (
          <div className="mb-5 flex items-center gap-3 rounded-xl border-2 border-ink bg-gold p-4 shadow-hard-2">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-cream shadow-hard-2">
              <Crown className="h-6 w-6" />
            </span>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-ink/60">
                Ketua terpilih · mayoritas mutlak
              </div>
              <div className="font-display text-lg font-bold leading-tight">{group.ketua.name}</div>
            </div>
          </div>
        ) : group.totalVotes > 0 ? (
          <div className="mb-5 flex items-center gap-3 rounded-xl border-2 border-ink bg-[#FFE8E8] p-4">
            <Info className="h-5 w-5 shrink-0 text-red-600" />
            <p className="text-xs font-semibold text-ink/70">
              Belum ada kandidat dengan suara mayoritas (≥{majorityNeeded}). Kalau mau ganti calon
              ketua, pilih kandidat lain — suara lamamu otomatis tertimpa.
            </p>
          </div>
        ) : (
          <div className="mb-5 flex items-center gap-3 rounded-xl border-2 border-dashed border-ink/35 bg-paper/70 p-4">
            <Vote className="h-5 w-5 shrink-0 text-ink/50" />
            <p className="text-xs font-semibold text-ink/60">
              Kuota penuh! Belum ada suara masuk — tiap anggota berhak memilih satu kandidat ketua.
            </p>
          </div>
        )}

        {/* Kandidat */}
        <ul className="space-y-2.5">
          {ranked.map((m) => {
            const pct = group.maxMembers > 0 ? Math.round((m.voteCount / group.maxMembers) * 100) : 0;
            const mine = myVote === m.id;
            return (
              <li
                key={m.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 border-ink p-3 transition-colors",
                  m.isKetua ? "bg-[#FFF4D6]" : mine ? "bg-[#EFE9FF]" : "bg-paper"
                )}
              >
                <Avatar name={m.name} className="h-10 w-10 text-xs" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-sm font-bold">{m.name}</span>
                    {m.isKetua && (
                      <Chip className="bg-gold">
                        <Crown className="h-3 w-3" /> Ketua
                      </Chip>
                    )}
                    {student?.id === m.id && <Chip className="bg-[#BBA8FF]">Kamu</Chip>}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-2.5 w-full max-w-44 overflow-hidden rounded-full border-2 border-ink bg-white">
                      <AnimatedBar
                        percent={pct}
                        color={mine ? "#BBA8FF" : avatarColor(m.name)}
                        className="h-full rounded-full"
                      />
                    </div>
                    <span className="shrink-0 text-xs font-bold tabular-nums text-ink/60">
                      {m.voteCount} suara
                    </span>
                  </div>
                </div>
                {ready && isMember && (
                  <button
                    onClick={() => vote(m.id, m.name.split(" ")[0])}
                    disabled={busyId !== null || mine}
                    className={cn(
                      btnBase,
                      "shrink-0 px-3",
                      mine ? "bg-[#BBA8FF] shadow-none" : "bg-cream"
                    )}
                  >
                    {busyId === m.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : mine ? (
                      "Pilihanmu"
                    ) : (
                      "Pilih"
                    )}
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {/* Aksi & aturan */}
        {ready && isMember && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            {myVote ? (
              <button
                onClick={unvote}
                disabled={busyUndo}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/55 underline-offset-2 hover:text-red-600 hover:underline"
              >
                {busyUndo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Undo2 className="h-3.5 w-3.5" />}
                Tarik kembali suaraku
              </button>
            ) : (
              <span className="text-xs font-semibold text-ink/45">
                Kamu belum memilih — ketuk tombol Pilih di salah satu kandidat.
              </span>
            )}
          </div>
        )}
        {ready && !isMember && (
          <p className="mt-4 text-center text-xs font-semibold text-ink/45">
            Hanya anggota kelompok ini yang bisa ikut voting.
          </p>
        )}

        <div className="mt-4 rounded-xl border-2 border-dashed border-ink/25 bg-paper/60 px-4 py-3 text-[11px] leading-relaxed text-ink/50">
          <span className="font-bold text-ink/65">Aturan main:</span> 1 anggota = 1 suara. Ganti
          pilihan kapan saja — suara lama otomatis tertimpa (ter-kick). Kandidat resmi jadi ketua
          jika meraih mayoritas mutlak (lebih dari separuh anggota).
        </div>
      </div>
    </Card>
  );
}
