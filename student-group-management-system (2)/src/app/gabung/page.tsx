import { IdCard, MousePointerClick, Crown, Info } from "lucide-react";
import { Card, Chip } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { GabungContent } from "@/components/student-widgets";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gabung Kelompok — KelompokKu",
};

const STEPS = [
  {
    icon: IdCard,
    bg: "#BBA8FF",
    title: "Check-in pakai NIM & nama",
    desc: "Cukup sekali — identitasmu tersimpan di browser ini dan dipakai untuk semua mata kuliah.",
  },
  {
    icon: MousePointerClick,
    bg: "#FFC94D",
    title: "Pilih mata kuliah & kelompok",
    desc: "Satu NIM hanya bisa masuk satu kelompok per mata kuliah. Kuota penuh = tombol terkunci.",
  },
  {
    icon: Crown,
    bg: "#8BE8A5",
    title: "Voting ketua saat kelompok penuh",
    desc: "Setiap anggota berhak memilih satu kandidat. Ganti pilihan? Suara lama otomatis tertimpa.",
  },
];

export default function GabungPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
      <section className="grid gap-10 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:pt-16">
        <Reveal>
          <Chip className="bg-gold">Check-in Mahasiswa</Chip>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Amankan kursimu di kelompok.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-ink/60">
            Tidak perlu akun, tidak perlu password. Isi NIM &amp; nama, lalu langsung pilih
            kelompok yang masih punya slot kosong.
          </p>

          <div className="mt-8 space-y-3">
            {STEPS.map((s, i) => (
              <Card key={s.title} className="flex gap-4 p-4 transition-transform hover:-translate-y-0.5">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink shadow-hard-2"
                  style={{ backgroundColor: s.bg }}
                >
                  <s.icon className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <div>
                  <div className="font-display text-sm font-bold tracking-tight">
                    <span className="mr-1.5 text-ink/35">{i + 1}.</span>
                    {s.title}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink/55">{s.desc}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex items-start gap-2.5 rounded-xl border-2 border-dashed border-ink/30 bg-cream/70 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink/45" />
            <p className="text-xs leading-relaxed text-ink/55">
              Ketik NIM dengan benar — NIM adalah identitas resmimu di sistem ini. Rekap kelompok di
              Excel dihitung dari NIM, sekaligus jadi kunci supaya satu orang tidak bisa mengisi dua
              slot di mata kuliah yang sama.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <Card className="h-fit p-6 shadow-hard-6 lg:sticky lg:top-24">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-ink bg-gold shadow-hard-2">
                <IdCard className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold leading-tight tracking-tight">
                  Identitas Mahasiswa
                </h2>
                <p className="text-xs text-ink/50">Sesuai kartu rencana studi kamu</p>
              </div>
            </div>
            <GabungContent />
          </Card>
        </Reveal>
      </section>
    </div>
  );
}
