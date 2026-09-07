import { Users, BadgeCheck, UserX2 } from "lucide-react";
import { listCourses, listUnassigned, dashboardStats } from "@/lib/data";
import { isDosen } from "@/lib/auth";
import { Chip, BigStat } from "@/components/ui";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { UnassignedBrowser, type UnassignedTab } from "@/components/unassigned-browser";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Belum Punya Kelompok — KelompokKu",
};

export default async function BelumKelompokPage() {
  const [courses, stats, dosen] = await Promise.all([listCourses(), dashboardStats(), isDosen()]);

  const tabs: UnassignedTab[] = await Promise.all(
    courses.map(async (c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      colorIndex: c.colorIndex,
      list: await listUnassigned(c.id),
    }))
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
      <section className="pt-12">
        <Reveal>
          <Chip className="bg-[#FF9A76]">Pantauan kelas</Chip>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Belum Punya Kelompok
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/60">
            Daftar live mahasiswa yang belum tergabung di setiap mata kuliah. Pakai untuk
            follow-up manual, broadcast pengingat, atau langsung dirandomisasi lewat tombol{" "}
            <span className="font-bold">Acak &amp; Isi Otomatis</span> di halaman mata kuliah.
          </p>
        </Reveal>

        <Stagger className="mt-8 grid grid-cols-3 gap-3 sm:gap-4 lg:max-w-3xl">
          <StaggerItem>
            <BigStat icon={Users} value={stats.totalStudents} label="Total Mahasiswa" accent="#BBA8FF" />
          </StaggerItem>
          <StaggerItem>
            <BigStat icon={BadgeCheck} value={stats.assigned} label="Sudah Berkelompok" accent="#8BE8A5" />
          </StaggerItem>
          <StaggerItem>
            <BigStat icon={UserX2} value={stats.unassignedGlobal} label="Belum Sama Sekali" accent="#FF9A76" />
          </StaggerItem>
        </Stagger>

        <Reveal delay={0.15} className="mt-10">
          <UnassignedBrowser tabs={tabs} isDosen={dosen} />
        </Reveal>
      </section>
    </div>
  );
}
