import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadCsv } from "@/lib/admin";
import {
  cn,
  formatMinutes,
  formatMonth,
  formatTime,
  formatWorkDate,
  shiftMonth,
  WORK_SCHEDULE_LABELS,
} from "@/lib/utils";
import { ChevronLeft, ChevronRight, Download, Flag } from "lucide-react";
import type { AttendanceDay, AttendanceLog as Log } from "@/types/attendance";

interface Props {
  log?: Log;
  month: string;
  currentMonth: string;
  isFetching: boolean;
  onMonthChange: (month: string) => void;
  exportName: string;
  viewer: "client" | "driver" | "admin";
  onFlag?: (day: AttendanceDay) => void;
}

const CHIP_TONES = {
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-600",
  brand: "bg-brand-soft text-brand",
  slate: "bg-slate-100 text-slate-600",
};

const STATUS_LABELS: Record<AttendanceDay["status"], string> = {
  COMPLETE: "Worked",
  ON_DUTY: "On duty",
  NO_CHECK_OUT: "No check-out",
  MISSED: "No check-in",
};

const Chip = function ({
  tone,
  children,
}: {
  tone: keyof typeof CHIP_TONES;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        CHIP_TONES[tone],
      )}
    >
      {children}
    </span>
  );
};

const exportLog = function (log: Log, exportName: string) {
  downloadCsv(
    `${exportName}-${log.month}.csv`,
    [
      "Date",
      "Status",
      "Checked in",
      "Checked out",
      "Hours worked",
      "Minutes late",
      "Scheduled day",
      "Flag",
    ],
    [...log.days]
      .reverse()
      .map((day) => [
        day.work_date,
        STATUS_LABELS[day.status],
        day.checked_in_at ? formatTime(day.checked_in_at) : "",
        day.checked_out_at ? formatTime(day.checked_out_at) : "",
        day.minutes_worked != null ? (day.minutes_worked / 60).toFixed(2) : "",
        day.minutes_late ?? "",
        day.status === "MISSED" ? "Yes" : day.scheduled_day ? "Yes" : "No",
        day.flag_reason
          ? `${day.flag_reason}${day.flag_resolution ? ` (${day.flag_resolution.toLowerCase()})` : ""}`
          : "",
      ]),
  );
};

export const AttendanceLog = function ({
  log,
  month,
  currentMonth,
  isFetching,
  onMonthChange,
  exportName,
  viewer,
  onFlag,
}: Props) {
  const firstMonth = log?.tracking_since?.slice(0, 7) ?? currentMonth;
  const hours =
    log?.resumption_time && log.closing_time
      ? `${log.resumption_time} - ${log.closing_time}`
      : null;
  const schedule = [
    log?.schedule ? WORK_SCHEDULE_LABELS[log.schedule] : null,
    hours,
  ]
    .filter(Boolean)
    .join(" · ");

  const stats = log
    ? [
        { label: "Days worked", value: String(log.summary.days_worked) },
        {
          label: "On time",
          value:
            log.summary.punctuality != null
              ? `${log.summary.punctuality}%`
              : "-",
          caption: log.summary.late
            ? `${log.summary.late} late start${log.summary.late > 1 ? "s" : ""}`
            : undefined,
        },
        {
          label: "Average day",
          value:
            log.summary.average_minutes != null
              ? formatMinutes(log.summary.average_minutes)
              : "-",
        },
        {
          label: "No check-in",
          value: String(log.summary.missed),
          alert: log.summary.missed > 0,
        },
      ]
    : [];

  return (
    <div className="border-border rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3 p-4 md:px-6 md:pt-5">
        <div className="min-w-0">
          <AppText type="h4" className="text-[15px] font-semibold">
            Attendance
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            {schedule || "Daily check-ins and check-outs"}
          </AppText>
        </div>

        <div className="flex items-center gap-2">
          <div className="border-border flex items-center rounded-xl border">
            <button
              type="button"
              aria-label="Previous month"
              className="text-muted-foreground hover:text-ink grid size-9 place-items-center disabled:opacity-30"
              disabled={month <= firstMonth}
              onClick={() => onMonthChange(shiftMonth(month, -1))}
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="min-w-[112px] text-center text-[13px] font-semibold">
              {formatMonth(month)}
            </span>
            <button
              type="button"
              aria-label="Next month"
              className="text-muted-foreground hover:text-ink grid size-9 place-items-center disabled:opacity-30"
              disabled={month >= currentMonth}
              onClick={() => onMonthChange(shiftMonth(month, 1))}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <Button
            variant="outline"
            className="size-9 rounded-xl p-0"
            aria-label="Download this month as CSV"
            title="Download this month as CSV"
            disabled={!log?.days.length}
            onClick={() => log && exportLog(log, exportName)}
          >
            <Download className="size-4" />
          </Button>
        </div>
      </div>

      {!log && isFetching ? (
        <div className="space-y-2 px-4 pb-5 md:px-6">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ) : log ? (
        <>
          <div className="grid grid-cols-2 gap-2.5 px-4 sm:grid-cols-4 md:px-6">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl bg-slate-50 p-3">
                <AppText
                  type="caption"
                  className="text-muted-foreground block text-[11.5px]"
                >
                  {stat.label}
                </AppText>
                <AppText
                  type="label"
                  className={cn(
                    "mt-0.5 block text-lg font-semibold",
                    stat.alert && "text-red-600",
                  )}
                >
                  {stat.value}
                </AppText>
                {stat.caption && (
                  <AppText
                    type="caption"
                    className="block text-[11px] text-amber-600"
                  >
                    {stat.caption}
                  </AppText>
                )}
              </div>
            ))}
          </div>

          {log.days.length ? (
            <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
              {log.days.map((day) => (
                <li
                  key={day.work_date}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 md:px-6"
                >
                  <div className="flex items-center justify-between gap-3 sm:w-28 sm:shrink-0">
                    <AppText type="label" className="text-[13px] font-semibold">
                      {formatWorkDate(day.work_date)}
                    </AppText>
                  </div>

                  <div className="min-w-0 flex-1">
                    {day.status === "MISSED" ? (
                      <AppText
                        type="caption"
                        className="text-muted-foreground text-[13px]"
                      >
                        No check-in on a working day
                      </AppText>
                    ) : (
                      <AppText type="caption" className="text-ink text-[13px]">
                        {formatTime(day.checked_in_at!)}
                        <span className="text-muted-foreground"> → </span>
                        {day.checked_out_at
                          ? formatTime(day.checked_out_at)
                          : day.status === "ON_DUTY"
                            ? "on duty"
                            : "no check-out"}
                        {day.minutes_worked != null && (
                          <span className="text-muted-foreground">
                            {" "}
                            · {formatMinutes(day.minutes_worked)}
                          </span>
                        )}
                      </AppText>
                    )}
                    {day.flag_reason && (
                      <AppText
                        type="caption"
                        className="mt-0.5 block text-xs text-red-600"
                      >
                        {viewer === "client"
                          ? "You flagged this"
                          : "Flagged by the client"}
                        : &ldquo;{day.flag_reason}&rdquo;
                      </AppText>
                    )}
                    {day.flag_resolution_note && (
                      <AppText
                        type="caption"
                        className="text-muted-foreground mt-0.5 block text-xs"
                      >
                        Haya Drivers{" "}
                        {day.flag_resolution === "UPHELD"
                          ? "upheld the flag"
                          : "cleared the flag"}
                        : {day.flag_resolution_note}
                      </AppText>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                    {day.status === "MISSED" && (
                      <Chip tone="red">No check-in</Chip>
                    )}
                    {day.status === "ON_DUTY" && (
                      <Chip tone="green">On duty</Chip>
                    )}
                    {day.status === "NO_CHECK_OUT" && (
                      <Chip tone="slate">No check-out</Chip>
                    )}
                    {day.late && day.flag_resolution !== "UPHELD" && (
                      <Chip tone="amber">Late {day.minutes_late}m</Chip>
                    )}
                    {day.minutes_late != null && !day.late && (
                      <Chip tone="green">On time</Chip>
                    )}
                    {day.scheduled_day === false && (
                      <Chip tone="brand">Extra day</Chip>
                    )}
                    {day.flagged_at && (
                      <Chip
                        tone={
                          day.flag_resolution === "DISMISSED" ? "slate" : "red"
                        }
                      >
                        <Flag className="size-3" />
                        {day.flag_resolution === "UPHELD"
                          ? "Flag upheld"
                          : day.flag_resolution === "DISMISSED"
                            ? "Flag cleared"
                            : "Flagged"}
                      </Chip>
                    )}
                    {onFlag && day.id && !day.flagged_at && (
                      <Button
                        variant="ghost"
                        className="text-muted-foreground h-7 rounded-lg px-2 text-xs hover:text-red-600"
                        onClick={() => onFlag(day)}
                      >
                        <Flag className="size-3.5" />
                        Flag
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <AppText
              type="caption"
              className="text-muted-foreground block px-4 py-8 text-center md:px-6"
            >
              {log.tracking_since
                ? "No check-ins this month."
                : viewer === "driver"
                  ? "No check-ins yet. Check in from here or your overview at the start of each working day."
                  : "The driver hasn't checked in yet. Check-ins appear here as they happen."}
            </AppText>
          )}
          <div className="h-2" />
        </>
      ) : null}
    </div>
  );
};
