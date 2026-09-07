import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  GraduationCap,
  Users,
  Layers,
  CheckCircle2,
  UserX2,
  FolderOpen,
  FileSpreadsheet,
} from "lucide-react";
import { getCourseDetail } from "@/lib/data";
import { isDosen } from "@/lib/auth";
import { courseColor } from "@/lib/utils";
import { Card, Chip, EmptyState } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { GroupsGrid } from "@/components/group-widgets";
import { CourseToolbar } from "@/components/dosen-tools";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function MatakuliahPage({ params }: Props) {
  const { id } = await params;
  const [course, dosen] = await Promise.all([getCourseDetail(id), isDosen()]);
  if (!course) notFound();
  const color = courseColor(course.colorIndex);

  const minis = [
    { icon: Layers, v: course.groupCount, l: "Kelompok" },
    { icon: CheckCircle2, v: course.fullGroupCount, l: "Penuh" },
    { icon: Users, v: course.registeredCount, l: "Terdaftar" },
    { icon: UserX2, v: course.unassignedCount, l: "Belum Dapat" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
      <Reveal>
        <nav className="flex items-center gap-1.5 pt-6 text-xs font-bold text-ink/50">
          <Link href="/" className="hover:text-ink">
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-ink">Mata Kuliah</span>
        </nav>

        {/* Header mata kuliah */}
        <div
          className="mt-4 rounded-2xl border-2 border-ink p-6 shadow-hard sm:p-8"
          style={{ backgroundColor: color.bg }}
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Chip className="bg-cream">{course.code || "MK"}</Chip>
                <Chip className="bg-cream/80 normal-case tracking-normal">
                  Kuota {course.maxMembers} orang / kelompok
                </Chip>
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {course.name}
              </h1>
              {course.lecturer && (
                <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-ink/65">
                  <GraduationCap className="h-4 w-4" /> {course.lecturer}
                </p>
              )}
            </div>
            <div className="flex flex-col items-center rounded-2xl border-2 border-ink bg-cream px-6 py-4 shadow-hard-2">
              <span className="font-display text-4xl font-bold tabular-nums">
                {course.maxMembers}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink/55">
                Maks. anggota
              </span>
            </div>
          </div>
        </div>

        {/* Statistik mini */}
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {minis.map((s) => (
            <Card key={s.l} className="flex items-center gap-3 p-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-paper shadow-hard-2">
                <s.icon className="h-4 w-4" />
              </span>
              <div>
                <div className="font-display text-xl font-bold leading-none tabular-nums">{s.v}</div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-ink/50">
                  {s.l}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Chip className="bg-gold">Kelompok</Chip>
            <span className="text-sm font-bold text-ink/55 tabular-nums">
              {course.groupCount} terbentuk
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!dosen && (
              <a
                href={`/api/export/${course.id}`}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-[#8BE8A5] px-4 py-2 text-sm font-bold shadow-hard-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              >
                <FileSpreadsheet className="h-4 w-4" /> Export Excel
              </a>
            )}
            {dosen && <CourseToolbar courseId={course.id} name={course.name} />}
          </div>
        </div>

        {/* Daftar kelompok */}
        <div className="mt-5">
          {course.groups.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="Belum ada kelompok"
              desc={
                dosen
                  ? "Buat kelompok lewat tombol di atas — atau langsung tekan Acak & Isi Otomatis untuk mendistribusikan mahasiswa sekaligus."
                  : "Komting belum membuka kelompok untuk mata kuliah ini. Sabar ya, cek lagi nanti."
              }
            />
          ) : (
            <GroupsGrid courseId={course.id} groups={course.groups} barColor={color.bg} />
          )}
        </div>

        {course.unassignedCount > 0 && (
          <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border-2 border-ink bg-[#FFEDE3] px-4 py-3 shadow-hard-2">
            <p className="text-sm font-bold">
              Masih ada {course.unassignedCount} mahasiswa tanpa kelompok di mata kuliah ini.
            </p>
            <Link
              href="/belum-kelompok"
              className="shrink-0 text-xs font-bold underline underline-offset-2 hover:text-ink/60"
            >
              Lihat daftar
            </Link>
          </div>
        )}
      </Reveal>
    </div>
  );
}
