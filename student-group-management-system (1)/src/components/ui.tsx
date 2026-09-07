import type { ReactNode } from "react";
import { cn, initials, avatarColor } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border-2 border-ink bg-cream shadow-hard", className)}>
      {children}
    </div>
  );
}

export function Chip({
  className,
  children,
  style,
}: {
  className?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={style}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border-2 border-ink px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusChip({ full }: { full: boolean }) {
  return full ? (
    <Chip className="bg-ink text-paper">Penuh</Chip>
  ) : (
    <Chip className="bg-[#8BE8A5]">Terbuka</Chip>
  );
}

export function Avatar({
  name,
  className,
  title,
}: {
  name: string;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title ?? name}
      className={cn(
        "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border-2 border-ink text-[11px] font-bold",
        className
      )}
      style={{ backgroundColor: avatarColor(name) }}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ names, max = 5 }: { names: string[]; max?: number }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <span className="flex items-center -space-x-2">
      {shown.map((n, i) => (
        <Avatar key={`${n}-${i}`} name={n} className="ring-2 ring-cream" />
      ))}
      {extra > 0 && (
        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-ink text-[11px] font-bold text-paper ring-2 ring-cream">
          +{extra}
        </span>
      )}
    </span>
  );
}

/** Bar kapasitas sebagai segmen — cocok untuk kuota kecil. */
export function CapacityBar({
  filled,
  total,
  color = "#FFC94D",
  className,
}: {
  filled: number;
  total: number;
  color?: string;
  className?: string;
}) {
  if (total > 12) {
    const pct = Math.min(100, Math.round((filled / total) * 100));
    return (
      <div className={cn("h-3 w-full overflow-hidden rounded-full border-2 border-ink bg-white", className)}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    );
  }
  return (
    <div className={cn("flex w-full gap-1", className)}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="h-2.5 flex-1 rounded-full border-2 border-ink transition-colors duration-300"
          style={{ backgroundColor: i < filled ? color : "#FFFFFF" }}
        />
      ))}
    </div>
  );
}

export function BigStat({
  icon: Icon,
  value,
  label,
  sub,
  accent = "#FFC94D",
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-3xl font-bold tabular-nums sm:text-4xl">{value}</div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-ink/60">{label}</div>
          {sub && <div className="mt-0.5 text-[11px] text-ink/45">{sub}</div>}
        </div>
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink shadow-hard-2"
          style={{ backgroundColor: accent }}
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
      </div>
    </Card>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  children?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 p-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-gold shadow-hard-2">
        <Icon className="h-7 w-7" strokeWidth={2} />
      </span>
      <h3 className="font-display text-xl font-bold tracking-tight">{title}</h3>
      <p className="max-w-md text-sm text-ink/55">{desc}</p>
      {children}
    </Card>
  );
}

export function PageHeader({
  kicker,
  title,
  desc,
  actions,
}: {
  kicker?: string;
  title: string;
  desc?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {kicker && (
          <Chip className="bg-gold">
            {kicker}
          </Chip>
        )}
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {desc && <p className="mt-2 text-sm leading-relaxed text-ink/60">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
