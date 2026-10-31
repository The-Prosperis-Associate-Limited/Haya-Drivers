import { AppText } from "@/components/shared/app-text";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  formatDateTime,
  formatMinutes,
  formatRelativeTime,
  formatTime,
  formatWorkDate,
} from "@/lib/utils";
import { CalendarDays, Check, X } from "lucide-react";
import type { AttendanceFlag, FlagResolution } from "@/types/attendance";

interface Props {
  flag: AttendanceFlag;
  onResolve: (flag: AttendanceFlag, outcome: FlagResolution) => void;
  onViewMonth: (flag: AttendanceFlag) => void;
}

const initialsOf = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export const FlagCard = function ({ flag, onResolve, onViewMonth }: Props) {
  const driverName = flag.driver?.name ?? "Driver";
  const hours =
    flag.booking.resumption_time && flag.booking.closing_time
      ? `${flag.booking.resumption_time} - ${flag.booking.closing_time}`
      : null;

  return (
    <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-11">
            <AvatarImage src={flag.driver?.profile_pic ?? undefined} alt="" />
            <AvatarFallback className="bg-brand-soft text-brand text-xs">
              {initialsOf(driverName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <AppText type="label" className="block truncate font-semibold">
              {driverName}
              <span className="text-muted-foreground font-normal">
                {" "}
                for {flag.client.name}
              </span>
            </AppText>
            <AppText
              type="caption"
              className="text-muted-foreground block truncate"
            >
              {flag.booking.reference} · flagged{" "}
              {formatRelativeTime(flag.flagged_at)}
            </AppText>
          </div>
        </div>

        {flag.flag_resolution ? (
          <StatusBadge
            label={flag.flag_resolution === "UPHELD" ? "Upheld" : "Dismissed"}
            className={
              flag.flag_resolution === "UPHELD"
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-slate-200 bg-slate-50 text-slate-600"
            }
          />
        ) : (
          <StatusBadge
            label="Open"
            className="border-amber-200 bg-amber-50 text-amber-700"
          />
        )}
      </div>

      <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-3.5 sm:grid-cols-3">
        <div>
          <AppText type="caption" className="text-muted-foreground block">
            Day
          </AppText>
          <AppText type="label" className="block text-sm font-semibold">
            {formatWorkDate(flag.work_date)}
            {!flag.scheduled_day && (
              <span className="text-brand text-xs font-medium">
                {" "}
                · extra day
              </span>
            )}
          </AppText>
        </div>
        <div>
          <AppText type="caption" className="text-muted-foreground block">
            Checked in / out
          </AppText>
          <AppText type="label" className="block text-sm font-semibold">
            {formatTime(flag.checked_in_at)} →{" "}
            {flag.checked_out_at ? formatTime(flag.checked_out_at) : "-"}
          </AppText>
        </div>
        <div>
          <AppText type="caption" className="text-muted-foreground block">
            Scheduled
          </AppText>
          <AppText type="label" className="block text-sm font-semibold">
            {hours ?? "Not set"}
            {flag.late && flag.minutes_late ? (
              <span className="text-xs font-medium text-amber-600">
                {" "}
                · {formatMinutes(flag.minutes_late)} late
              </span>
            ) : null}
          </AppText>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-red-100 bg-red-50/60 p-3.5">
        <AppText type="caption" className="block text-xs text-red-600">
          {flag.client.name} says
        </AppText>
        <AppText type="body" className="text-ink mt-0.5 text-sm">
          &ldquo;{flag.flag_reason}&rdquo;
        </AppText>
      </div>

      {flag.flag_resolution_note && (
        <AppText type="caption" className="text-muted-foreground mt-3 block">
          Resolved{" "}
          {flag.flag_resolved_at && formatDateTime(flag.flag_resolved_at)}:{" "}
          {flag.flag_resolution_note}
        </AppText>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          className="h-10 rounded-xl text-sm"
          onClick={() => onViewMonth(flag)}
        >
          <CalendarDays className="size-4" />
          View month
        </Button>
        {!flag.flag_resolution && (
          <>
            <Button
              variant="outline"
              className="h-10 rounded-xl text-sm"
              onClick={() => onResolve(flag, "DISMISSED")}
            >
              <X className="size-4" />
              Dismiss
            </Button>
            <Button
              className="h-10 rounded-xl bg-red-600 text-sm hover:bg-red-700"
              onClick={() => onResolve(flag, "UPHELD")}
            >
              <Check className="size-4" />
              Uphold
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
