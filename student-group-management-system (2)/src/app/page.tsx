import Link from "next/link";
import {
  Users,
  BookOpen,
  Layers,
  UserX2,
  GraduationCap,
  ArrowRight,
  Check,
  Crown,
  FileSpreadsheet,
  ChevronRight,
} from "lucide-react";
import { listCourses, dashboardStats, type CourseVM } from "@/lib/data";
import { isDosen } from "@/lib/auth";
import { cn, courseColor } from "@/lib/utils";
import { Card, Chip, BigStat, EmptyState, CapacityBar, AvatarStack } from "@/components/ui";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { CreateCoursePanel, SeedButton, DeleteCourseIcon } from "@/components/dosen-tools";

export const dynamic = "force-dynamic";

function CourseCard({ c, dosen }: { c: CourseVM; dosen: boolean }) {
  const color = courseColor(c.colorIndex);
  return (
    <Card className="flex flex-col overflow-hidden p-0 transition-transform duration-200 hover:-translate-y-1 hover:shadow-hard-6">
      <div className="border-b-2 border-ink px-5 py-4" style={{ backgroundColor: color.bg }}>
        <div className="flex items-center justify-between gap-2">
          <Chip className="bg-cream">{c.code || "MK"}</Chip>
          <div className="flex items-center gap-2">
            <Chip className="bg-cream/80 normal-case tracking-normal">
              Kuota {c.maxMembers} org/kelompok
            </Chip>
            {dosen && <DeleteCourseIcon courseId={c.id} name={c.name} />}
          </div>
        </div>
        <h3 className="mt-2.5 font-display text-xl font-bold leading-tight tracking-tight">
          {c.name}
        </h3>
        {c.lecturer && (
          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-ink/60">
            <GraduationCap className="h-3.5 w-3.5" /> {c.lecturer}
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { v: c.groupCount, l: "Kelompok" },
            { v: c.fullGroupCount, l: "Penuh" },
            { v: c.unassignedCount, l: "Belum Dapat" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border-2 border-ink/12 bg-paper/70 px-2 py-2">
              <div className="font-display text-xl font-bold tabular-nums">{s.v}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink/50">
                {s.l}
              </div>
            </div>
          ))}
        </div>

        {c.groups.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {c.groups.slice(0, 3).map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-ink/10 bg-paper/50 px-3 py-1.5 text-xs"
              >
                <span className="flex min-w-0 items-center gap-2 font-bold">
                  {g.ketua && <Crown className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
                  <span className="truncate">{g.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <AvatarStack names={g.members.map((m) => m.name)} max={4} />
                  <span
                    className={cn(
                      "rounded-full border border-ink px-1.5 py-px font-bold tabular-nums",
                      g.full ? "bg-ink text-paper" : "bg-white"
                    )}
                  >
                    {g.memberCount}/{g.maxMembers}
                  </span>
                </span>
              </li>
            ))}
            {c.groups.length > 3 && (
              <li className="px-1 text-[11px] font-semibold text-ink/45">
                +{c.groups.length - 3} kelompok lainnya...
              </li>
            )}
          </ul>
        )}

        <div className="mt-auto pt-4">
          <div className="flex items-center gap-2">
            <Link
              href={`/matakuliah/${c.id}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-ink bg-ink px-4 py-2.5 text-sm font-bold text-paper shadow-hard-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
            >
              Buka Mata Kuliah <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={`/api/export/${c.id}`}
              title="Export Excel mata kuliah ini"
              className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink bg-[#8BE8A5] shadow-hard-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
            >
              <FileSpreadsheet className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}

function HeroMock() {
  return (
    <div className="relative mx-auto hidden w-full max-w-sm lg:block">
      <div className="absolute -left-6 -top-5 rotate-[-8deg] animate-wiggle">
        <Chip className="bg-gold shadow-hard-2">
          <Crown className="h-3 w-3" /> Voting ketua
        </Chip>
      </div>
      <div className="absolute -right-2 top-24 rotate-6">
        <Chip className="bg-[#8BE8A5] shadow-hard-2">3/3 Penuh!</Chip>
      </div>
      <div className="rotate-2 rounded-2xl border-2 border-ink bg-cream p-5 shadow-hard-8">
        <div className="flex items-center justify-between">
          <span className="font-display font-bold">Kelompok 1</span>
          <Chip className="bg-ink text-paper">Penuh</Chip>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <AvatarStack names={["Aditya Pratama", "Nabila Rahma", "Fajar Nugroho"]} />
          <span className="text-sm font-bold tabular-nums">
            3<span className="text-ink/40">/3</span>
          </span>
        </div>
        <CapacityBar filled={3} total={3} color="#8BE8A5" className="mt-3" />
        <div className="mt-4 flex items-center gap-2 rounded-xl border-2 border-ink bg-gold p-2.5 text-sm font-bold">
          <Crown className="h-4 w-4" /> Ketua: Aditya P.
          <Check className="ml-auto h-4 w-4" />
        </div>
      </div>
      <div className="absolute -bottom-6 left-8 -rotate-3">
        <Chip className="bg-[#BBA8FF] shadow-hard-2">Export .xlsx</Chip>
      </div>
    </div>
  );
}

export default async function Home() {
  const [courses, stats, dosen] = await Promise.all([listCourses(), dashboardStats(), isDosen()]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* ============ HERO ============ */}
      <section className="grid items-center gap-10 pb-14 pt-12 lg:grid-cols-[1.15fr_0.85fr] lg:pt-16">
        <Reveal>
          <Chip className="bg-cream shadow-hard-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Sistem pembentukan kelompok kuliah
          </Chip>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Bikin kelompok kuliah,{" "}
            <span className="relative inline-block">
              <span
                className="absolute inset-0 -rotate-1 rounded-lg border-2 border-ink bg-gold"
                aria-hidden
              />
              <span className="relative px-1">tanpa drama</span>
            </span>{" "}
            grup chat.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/60">
            Komting cukup set kuota per mata kuliah — misal Agama 3 orang. Mahasiswa gabung pakai NIM
            &amp; nama, kelompok terkunci otomatis saat penuh, lalu semua anggota voting ketua.
            Selesai? Rekap tinggal di-export ke Excel.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/gabung"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-gold px-6 py-3.5 font-display text-base font-bold shadow-hard transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-2"
            >
              Gabung Kelompok <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/belum-kelompok"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-cream px-6 py-3.5 font-display text-base font-bold shadow-hard transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-2"
            >
              Siapa yang Belum Dapat?
            </Link>
          </div>
          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-ink/55">
            {["Kuota per mata kuliah", "Voting ketua otomatis", "Rekap Excel 1-klik"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 rounded-full border-2 border-ink bg-[#8BE8A5] p-0.5" />
                {t}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.15}>
          <HeroMock />
        </Reveal>
      </section>

      {/* ============ STATS ============ */}
      <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StaggerItem>
          <BigStat icon={Users} value={stats.totalStudents} label="Mahasiswa Terdaftar" accent="#BBA8FF" />
        </StaggerItem>
        <StaggerItem>
          <BigStat icon={BookOpen} value={stats.totalCourses} label="Mata Kuliah Aktif" accent="#7ED6FF" />
        </StaggerItem>
        <StaggerItem>
          <BigStat
            icon={Layers}
            value={stats.totalGroups}
            label="Kelompok Dibentuk"
            sub={`${stats.fullGroups} sudah penuh`}
            accent="#8BE8A5"
          />
        </StaggerItem>
        <StaggerItem>
          <BigStat icon={UserX2} value={stats.unassignedGlobal} label="Belum Punya Kelompok" accent="#FF9A76" />
        </StaggerItem>
      </Stagger>

      {/* ============ MATA KULIAH ============ */}
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Chip className="bg-gold">Daftar & Kuota</Chip>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">Mata Kuliah</h2>
          </div>
          {courses.length > 0 && (
            <a
              href="/api/export/all"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-[#8BE8A5] px-4 py-2.5 text-sm font-bold shadow-hard-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
            >
              <FileSpreadsheet className="h-4 w-4" /> Export Semua (.xlsx)
            </a>
          )}
        </div>

        {dosen && (
          <div className="mt-5 max-w-2xl">
            <CreateCoursePanel />
          </div>
        )}

        {courses.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={GraduationCap}
              title="Belum ada mata kuliah"
              desc="Mulai dengan memuat data contoh untuk melihat cara kerjanya, atau aktifkan Mode Komting lalu buat mata kuliah pertamamu beserta kuotanya."
            >
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                <SeedButton />
                {!dosen && (
                  <span className="text-xs text-ink/45">
                    Komting? Gunakan tombol Mode Komting di kanan atas.
                  </span>
                )}
              </div>
            </EmptyState>
          </div>
        ) : (
          <Stagger className="mt-6 grid gap-5 lg:grid-cols-2">
            {courses.map((c) => (
              <StaggerItem key={c.id}>
                <CourseCard c={c} dosen={dosen} />
              </StaggerItem>
            ))}
          </Stagger>
        )}

        {courses.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Link
              href="/belum-kelompok"
              className="group inline-flex items-center gap-1.5 text-sm font-bold text-ink/60 hover:text-ink"
            >
              Cek mahasiswa yang belum dapat kelompok
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
