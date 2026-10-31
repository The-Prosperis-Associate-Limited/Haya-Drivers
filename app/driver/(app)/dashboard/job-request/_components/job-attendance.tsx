"use client";

import { AttendanceLog } from "@/components/attendance/attendance-log";
import { monthKeyOf } from "@/lib/utils";
import { useState } from "react";
import { useAttendanceLog } from "../_hooks/use-job-requests";

interface Props {
  reference: string;
}

export const JobAttendance = function ({ reference }: Props) {
  const [currentMonth] = useState(() => monthKeyOf(new Date()));
  const [month, setMonth] = useState(currentMonth);

  const { log, isFetching } = useAttendanceLog(reference, month);

  return (
    <AttendanceLog
      log={log}
      month={month}
      currentMonth={currentMonth}
      isFetching={isFetching}
      onMonthChange={setMonth}
      exportName={`attendance-${reference}`}
      viewer="driver"
    />
  );
};
