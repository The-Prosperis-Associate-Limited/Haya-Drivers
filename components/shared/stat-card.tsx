import { cn } from "@/lib/utils";
import { Info, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { AppText } from "./app-text";
import { AppTooltip } from "./app-tooltip";

type Tone = "brand" | "green" | "amber" | "violet";

interface Props {
  label: string;
  value: React.ReactNode;
  hint?: string;
  caption?: React.ReactNode;
  captionTone?: "positive" | "muted" | "warning";
  href?: string;
  icon?: LucideIcon;
  tone?: Tone;
  aside?: React.ReactNode;
  className?: string;
}

const captionTones = {
  positive: "text-emerald-600",
  muted: "text-muted-foreground",
  warning: "text-amber-600",
} as const;

const iconTones: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-700",
  violet: "bg-violet-50 text-violet-600",
};

export const StatCard = function ({
  label,
  value,
  hint,
  caption,
  captionTone = "positive",
  href,
  icon: Icon,
  tone = "brand",
  aside,
  className,
}: Props) {
  const labelRow = (
    <span className="flex items-center gap-1.5">
      <AppText
        type="label"
        className={cn(
          Icon
            ? "text-muted-foreground font-medium"
            : "text-foreground uppercase",
        )}
      >
        {label}
      </AppText>
      {hint && (
        <AppTooltip content={hint}>
          <Info className="text-muted-foreground h-3.5 w-3.5" />
        </AppTooltip>
      )}
    </span>
  );

  const valueText = (
    <AppText
      type="h2"
      className={cn(
        "font-semibold",
        Icon
          ? "mt-1 text-[22px] tracking-tight md:text-[26px]"
          : "mt-2 text-2xl md:text-[28px]",
      )}
      as="p"
    >
      {value}
    </AppText>
  );

  const captionText = caption && (
    <AppText
      type="caption"
      className={cn(
        "mt-2 flex flex-wrap items-center gap-1.5",
        captionTones[captionTone],
      )}
    >
      {caption}
    </AppText>
  );

  const body = Icon ? (
    <>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className={cn(
            "grid size-9 place-items-center rounded-[11px]",
            iconTones[tone],
          )}
        >
          <Icon className="size-5" />
        </span>
        {aside}
      </div>
      {labelRow}
      {valueText}
      {captionText}
    </>
  ) : (
    <>
      {labelRow}
      {valueText}
      {captionText}
    </>
  );

  const classes = cn(
    "border-border rounded-xl border bg-white p-4 md:p-5",
    Icon && "rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
    href && "hover:border-brand/40 block transition-colors",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }

  return <div className={classes}>{body}</div>;
};
