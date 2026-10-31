"use client";

import { AttendanceLog } from "@/components/attendance/attendance-log";
import { AppDialog } from "@/components/shared/app-dialog";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { monthKeyOf } from "@/lib/utils";
import { useState } from "react";
import type { AdminAttendanceLog } from "@/types/attendance";
import type { APIResponse } from "@/types/response";

interface Props {
  reference: string | null;
  initialMonth?: string;
  onClose: () => void;
}

const MonthLog = function ({
  reference,
  initialMonth,
}: {
  reference: string;
  initialMonth?: string;
}) {
  const [currentMonth] = useState(() => monthKeyOf(new Date()));
  const [month, setMonth] = useState(initialMonth ?? currentMonth);

  const { data, isFetching } = useGetData<APIResponse<AdminAttendanceLog>>({
    url: API_ENDPOINTS.adminAttendance.booking(reference, month),
  });

  return (
    <AttendanceLog
      log={data?.data}
      month={month}
      currentMonth={currentMonth}
      isFetching={isFetching}
      onMonthChange={setMonth}
      exportName={`attendance-${reference}`}
      viewer="admin"
    />
  );
};

export const BookingAttendanceDialog = function ({
  reference,
  initialMonth,
  onClose,
}: Props) {
  return (
    <AppDialog
      isOpen={!!reference}
      onOpenChange={(open) => !open && onClose()}
      title="Attendance"
      description={reference ?? undefined}
      width="760px"
    >
      {reference && (
        <MonthLog
          key={reference}
          reference={reference}
          initialMonth={initialMonth}
        />
      )}
    </AppDialog>
  );
};
