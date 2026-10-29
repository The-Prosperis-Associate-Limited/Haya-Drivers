import { StatusBadge } from "@/components/shared/status-badge";
import { cn, formatTime } from "@/lib/utils";
import type { TodayAttendance } from "@/types/attendance";

interface Props {
  today: TodayAttendance;
  className?: string;
}

const TONES = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  brand: "border-brand/20 bg-brand-soft text-brand",
  slate: "border-slate-200 bg-slate-50 text-slate-600",
};

export const describeToday = function (today: TodayAttendance) {
  switch (today.state) {
    case "ON_DUTY":
      return {
        label: `On duty · ${formatTime(today.checked_in_at!)}${today.late ? " · late" : ""}`,
        tone: today.late ? TONES.amber : TONES.green,
      };
    case "CHECKED_OUT":
      return {
        label: `Checked out · ${formatTime(today.checked_out_at!)}`,
        tone: TONES.slate,
      };
    case "UPCOMING":
      return {
        label: `Starts ${formatTime(today.scheduled_start!)}`,
        tone: TONES.brand,
      };
    case "OFF_DAY":
      return { label: "Day off", tone: TONES.slate };
    default:
      return { label: "Not checked in", tone: TONES.amber };
  }
};

export const TodayAttendanceBadge = function ({ today, className }: Props) {
  const { label, tone } = describeToday(today);

  return (
    <StatusBadge
      label={label}
      className={cn("whitespace-nowrap normal-case", tone, className)}
    />
  );
};
