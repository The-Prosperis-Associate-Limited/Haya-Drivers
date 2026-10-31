"use client";

import { AttendanceLog } from "@/components/attendance/attendance-log";
import { FormTextarea } from "@/components/form/form-textarea";
import { AppDialog } from "@/components/shared/app-dialog";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatTime, formatWorkDate, monthKeyOf } from "@/lib/utils";
import {
  flagAttendanceSchema,
  type FlagAttendanceFormValues,
} from "@/schemas/requests/flag-attendance";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useHireAttendance } from "../_hooks/use-hires";
import type { AttendanceDay } from "@/types/attendance";

interface Props {
  reference: string;
  driverName: string;
}

export const HireAttendance = function ({ reference, driverName }: Props) {
  const [currentMonth] = useState(() => monthKeyOf(new Date()));
  const [month, setMonth] = useState(currentMonth);
  const [flagging, setFlagging] = useState<AttendanceDay | null>(null);

  const { log, isFetching } = useHireAttendance(reference, month);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FlagAttendanceFormValues>({
    resolver: zodResolver(flagAttendanceSchema),
    defaultValues: { reason: "" },
  });

  const close = () => {
    setFlagging(null);
    reset();
  };

  const { mutate, isPending } = useSubmitData<FlagAttendanceFormValues>({
    url: () => API_ENDPOINTS.hires.flagDay(reference, flagging?.id ?? ""),
    onSuccessMessage: "Day flagged - our team will look into it",
    onSuccess: close,
  });

  return (
    <>
      <AttendanceLog
        log={log}
        month={month}
        currentMonth={currentMonth}
        isFetching={isFetching}
        onMonthChange={setMonth}
        exportName={`attendance-${reference}`}
        viewer="client"
        onFlag={setFlagging}
      />

      <AppDialog
        isOpen={!!flagging}
        onOpenChange={(open) => !open && close()}
        title="Flag this day"
        description={
          flagging
            ? `${driverName} checked in on ${formatWorkDate(flagging.work_date)} at ${formatTime(flagging.checked_in_at!)}. Tell us what doesn't match - our team follows up with you and the driver.`
            : undefined
        }
        width="480px"
        isSubmitting={isPending}
      >
        <form
          onSubmit={handleSubmit((values) => mutate(values))}
          className="space-y-4"
        >
          <FormTextarea
            control={control}
            name="reason"
            errors={errors}
            label="What went wrong?"
            placeholder="E.g. checked in but arrived at 10am, left before closing time."
            rows={4}
          />
          <Button
            type="submit"
            isLoading={isPending}
            className="h-11 w-full rounded-xl text-sm"
          >
            Flag day
          </Button>
        </form>
      </AppDialog>
    </>
  );
};
