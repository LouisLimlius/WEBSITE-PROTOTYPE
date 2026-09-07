import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Palet warna per mata kuliah — bergaya paper / neo-academic. */
export const COURSE_COLORS = [
  { bg: "#BBA8FF", soft: "#EFE9FF", label: "Violet" },
  { bg: "#FFC24B", soft: "#FFF1D6", label: "Amber" },
  { bg: "#7ED6FF", soft: "#E2F5FF", label: "Sky" },
  { bg: "#FF9EC6", soft: "#FFE8F2", label: "Rose" },
  { bg: "#8BE8A5", soft: "#E4F9EA", label: "Mint" },
  { bg: "#FF9A76", soft: "#FFECE4", label: "Coral" },
  { bg: "#A6E34D", soft: "#F0FADB", label: "Lime" },
  { bg: "#8FE3DC", soft: "#E2F8F6", label: "Teal" },
];

export function courseColor(index: number) {
  return COURSE_COLORS[((index % COURSE_COLORS.length) + COURSE_COLORS.length) % COURSE_COLORS.length];
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_COLORS = ["#BBA8FF", "#FFC24B", "#7ED6FF", "#FF9EC6", "#8BE8A5", "#FF9A76", "#A6E34D", "#8FE3DC"];

export function avatarColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function formatDate(d: Date | string | null | undefined) {
  if (!d) return "-";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Hitung ketua terpilih: kandidat dengan suara mayoritas mutlak (> separuh anggota). */
export function electLeader(
  memberCount: number,
  voteCounts: Map<string, number>
): { leaderId: string | null; top: number; total: number } {
  let leaderId: string | null = null;
  let top = 0;
  let total = 0;
  let tie = false;
  for (const [id, c] of voteCounts) {
    total += c;
    if (c > top) {
      top = c;
      leaderId = id;
      tie = false;
    } else if (c === top) {
      tie = true;
    }
  }
  if (!leaderId || tie) return { leaderId: null, top, total };
  if (memberCount > 0 && top * 2 <= memberCount) return { leaderId: null, top, total };
  return { leaderId, top, total };
}
