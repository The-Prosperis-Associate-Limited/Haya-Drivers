export type TodayAttendanceState =
  "ON_DUTY" | "CHECKED_OUT" | "NOT_IN" | "UPCOMING" | "OFF_DAY";

export interface TodayAttendance {
  state: TodayAttendanceState;
  checked_in_at: string | null;
  checked_out_at: string | null;
  minutes_late: number | null;
  late: boolean;
  scheduled_start: string | null;
}

export type AttendanceDayStatus =
  "COMPLETE" | "ON_DUTY" | "NO_CHECK_OUT" | "MISSED";

export interface AttendanceDay {
  id?: string;
  work_date: string;
  status: AttendanceDayStatus;
  checked_in_at?: string;
  checked_out_at?: string | null;
  minutes_late?: number | null;
  late?: boolean;
  scheduled_day?: boolean;
  minutes_worked?: number | null;
  flagged_at?: string | null;
  flag_reason?: string | null;
  flag_resolution?: FlagResolution | null;
  flag_resolution_note?: string | null;
  flag_resolved_at?: string | null;
}

export type FlagResolution = "UPHELD" | "DISMISSED";

export interface AttendanceFlag {
  id: string;
  work_date: string;
  checked_in_at: string;
  checked_out_at: string | null;
  minutes_late: number | null;
  late: boolean;
  scheduled_day: boolean;
  flagged_at: string;
  flag_reason: string;
  flag_resolution: FlagResolution | null;
  flag_resolution_note: string | null;
  flag_resolved_at: string | null;
  booking: {
    reference: string;
    title: string;
    resumption_time: string | null;
    closing_time: string | null;
  };
  client: { id: string; name: string; profile_pic: string | null };
  driver: { id: string; name: string; profile_pic: string | null } | null;
}

export interface AdminAttendanceLog extends AttendanceLog {
  booking: { reference: string; title: string; client: string; driver: string };
}

export interface AttendanceLog {
  month: string;
  tracking_since: string | null;
  schedule: string | null;
  resumption_time: string | null;
  closing_time: string | null;
  today: TodayAttendance | null;
  summary: {
    days_worked: number;
    on_time: number;
    late: number;
    missed: number;
    flagged: number;
    minutes_worked: number;
    average_minutes: number | null;
    punctuality: number | null;
  };
  days: AttendanceDay[];
}
