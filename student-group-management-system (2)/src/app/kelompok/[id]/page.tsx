import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Users, GraduationCap, BadgeCheck } from "lucide-react";
import { getGroupDetail } from "@/lib/data";
import { isDosen } from "@/lib/auth";
import { courseColor } from "@/lib/utils";
import { Card, Chip, CapacityBar, StatusChip } from "@/components/ui";
import { Reveal } from "@/components/motion";
import {
  JoinLeavePanel,
  CopyLink,
  MemberList,
  DeleteGroupButton,
} from "@/components/group-widgets";
import { VotePanel } from "@/components/vote-panel";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function KelompokPage({ params }: Props) {
  const { id } = await params;
  const [data, dosen] = await Promise.all([getGroupDetail(id), isDosen()]);
  if (!data) notFound();
  const { group, course } = data;
  const color = courseColor(course.colorIndex);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
      <Reveal>
        <nav className="flex flex-wrap items-center gap-1.5 pt-6 text-xs font-bold text-ink/50">
          <Link href="/" className="hover:text-ink">
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/matakuliah/${course.id}`} className="hover:text-ink">
            {course.code || course.name}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-ink">{group.name}</span>
        </nav>

        {/* Header */}
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Chip className="text-ink" style={{ backgroundColor: color.bg }}>
                {course.code || "MK"}
              </Chip>
              <StatusChip full={group.full} />
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {group.name}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink/55">
              <span className="font-semibold">{course.name}</span>
              {course.lecturer && (
                <span className="flex items-center gap-1 text-xs">
                  <GraduationCap className="h-3.5 w-3.5" /> {course.lecturer}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CopyLink path={`/kelompok/${group.id}`} label="Salin tautan" />
            {dosen && <DeleteGroupButton groupId={group.id} name={group.name} />}
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[360px_1fr]">
          {/* Kolom kiri: kapasitas + anggota */}
          <div className="space-y-5">
            <Card className="p-5">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-ink/50">
                    Kapasitas
                  </div>
                  <div className="mt-1 font-display text-5xl font-bold leading-none tabular-nums">
                    {group.memberCount}
                    <span className="text-2xl text-ink/35">/{group.maxMembers}</span>
                  </div>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink shadow-hard-2" style={{ backgroundColor: color.bg }}>
                  <Users className="h-5 w-5" />
                </span>
              </div>
              <CapacityBar
                filled={group.memberCount}
                total={group.maxMembers}
                color={group.full ? "#8BE8A5" : color.bg}
                className="mt-4"
              />
              <p className="mt-3 text-xs leading-relaxed text-ink/50">
                {group.full
                  ? "Kuota penuh — slot terkunci dan voting ketua sudah dibuka."
                  : `Masih ada ${group.maxMembers - group.memberCount} slot kosong. Kuota ditentukan komting; kelompok terkunci otomatis saat penuh.`}
              </p>
              <div className="mt-4">
                <JoinLeavePanel group={group} />
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold tracking-tight">Anggota</h2>
                <Chip className="bg-smoke tabular-nums">{group.memberCount} orang</Chip>
              </div>
              <MemberList members={group.members} groupId={group.id} isDosen={dosen} />
              {group.members.length > 0 && !group.full && (
                <p className="mt-4 flex items-start gap-2 rounded-lg border-2 border-dashed border-ink/25 bg-paper/60 px-3 py-2 text-[11px] leading-relaxed text-ink/50">
                  <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Satu NIM hanya bisa menempati satu kelompok pada mata kuliah ini.
                </p>
              )}
            </Card>
          </div>

          {/* Kolom kanan: voting */}
          <VotePanel group={group} />
        </div>
      </Reveal>
    </div>
  );
}
