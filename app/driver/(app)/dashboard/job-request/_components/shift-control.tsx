"use client";

import { AppText } from "@/components/shared/app-text";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { cn, formatMinutes, formatTime } from "@/lib/utils";
import { LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { useCheckIn, useCheckOut } from "../_hooks/use-job-requests";
import type { Booking } from "@/types/booking";
import type { TodayAttendance } from "@/types/attendance";

interface Props {
  booking: Booking;
  className?: string;
}

const statusLine = function (today: TodayAttendance) {
  switch (today.state) {
    case "ON_DUTY":
      return {
        dot: today.late ? "bg-amber-500" : "bg-emerald-500",
        text: `On duty since ${formatTime(today.checked_in_at!)}${today.late && today.minutes_late ? ` · ${formatMinutes(today.minutes_late)} late` : ""}`,
      };
    case "CHECKED_OUT":
      return {
        dot: "bg-slate-400",
        text: `Done for today - checked out at ${formatTime(today.checked_out_at!)}`,
      };
    case "UPCOMING":
      return {
        dot: "bg-brand",
        text: `Your day starts at ${formatTime(today.scheduled_start!)}`,
      };
    case "OFF_DAY":
      return {
        dot: "bg-slate-300",
        text: "Day off on your schedule - checking in logs an extra day",
      };
    default:
      return {
        dot: "bg-amber-500",
        text: today.scheduled_start
          ? `Your day started at ${formatTime(today.scheduled_start)} - check in now`
          : "Check in when you start work",
      };
  }
};

export const ShiftControl = function ({ booking, className }: Props) {
  const [confirmingOut, setConfirmingOut] = useState(false);

  const { checkIn, isPending: isCheckingIn } = useCheckIn(booking.reference);
  const { checkOut, isPending: isCheckingOut } = useCheckOut(booking.reference);

  const today = booking.today_attendance;

  if (booking.status !== "IN_PROGRESS" || !today) return null;

  const line = statusLine(today);

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-start gap-2">
        <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", line.dot)} />
        <AppText type="caption" className="text-foreground/80 text-[12.5px]">
          {line.text}
        </AppText>
      </div>

      {today.state === "ON_DUTY" ? (
        <Button
          variant="outline"
          className="h-10 w-full rounded-xl text-sm"
          isLoading={isCheckingOut}
          onClick={() => setConfirmingOut(true)}
        >
          <LogOut className="size-4" />
          Check out
        </Button>
      ) : today.state !== "CHECKED_OUT" ? (
        <Button
          className="h-10 w-full rounded-xl text-sm"
          isLoading={isCheckingIn}
          onClick={() => checkIn({})}
        >
          <LogIn className="size-4" />
          Check in
        </Button>
      ) : null}

      <ConfirmDialog
        isOpen={confirmingOut}
        onOpenChange={setConfirmingOut}
        icon={LogOut}
        iconClassName="text-brand"
        title="Check out for today?"
        description="This ends today's shift now and can't be undone - you can check in again on your next working day."
        confirmLabel="Check out"
        isLoading={isCheckingOut}
        onConfirm={() =>
          checkOut({}, { onSuccess: () => setConfirmingOut(false) })
        }
      />
    </div>
  );
};
