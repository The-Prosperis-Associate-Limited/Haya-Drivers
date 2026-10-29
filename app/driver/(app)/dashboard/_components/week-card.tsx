import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import { clientNameOf, cn, formatDate } from "@/lib/utils";
import { Clock, MapPin } from "lucide-react";
import Link from "next/link";
import type { Booking } from "@/types/booking";
import { ShiftControl } from "../job-request/_components/shift-control";

interface Props {
  job?: Booking;
}

// Monday-first day indexes each schedule covers; CUSTOM is agreed off-platform.
const WORKING_DAYS: Record<string, number[]> = {
  WEEKDAYS: [0, 1, 2, 3, 4],
  WEEKDAYS_AND_SATURDAY: [0, 1, 2, 3, 4, 5],
  FULL_WEEK: [0, 1, 2, 3, 4, 5, 6],
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const WeekCard = function ({ job }: Props) {
  const now = new Date();
  const todayIndex = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - todayIndex);

  const days = DAY_NAMES.map((name, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return { name, date: date.getDate(), index };
  });

  const working =
    job?.schedule && job.status === "IN_PROGRESS"
      ? (WORKING_DAYS[job.schedule] ?? [])
      : [];
  const worksToday = working.includes(todayIndex);
  const hours =
    job?.resumption_time && job.closing_time
      ? `${job.resumption_time} - ${job.closing_time}`
      : null;

  return (
    <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
      <AppText type="h4" className="text-[15px] font-semibold">
        This week
      </AppText>
      <AppText type="caption" className="text-muted-foreground block">
        {job?.schedule === "CUSTOM"
          ? "Custom schedule - agreed with your client"
          : "Your working days at a glance"}
      </AppText>

      <div className="mt-4 grid grid-cols-7 gap-1.5" suppressHydrationWarning>
        {days.map(({ name, date, index }) => (
          <div
            key={name}
            className={cn(
              "grid place-items-center gap-1 rounded-xl py-2 text-[11px]",
              index === todayIndex
                ? "bg-brand text-white/80"
                : "text-muted-foreground",
            )}
          >
            <span>{name}</span>
            <b
              className={cn(
                "text-[15px] font-semibold",
                index === todayIndex ? "text-white" : "text-ink",
              )}
            >
              {date}
            </b>
            <i
              className={cn(
                "size-[5px] rounded-full",
                working.includes(index)
                  ? index === todayIndex
                    ? "bg-white"
                    : "bg-brand"
                  : "bg-transparent",
              )}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2.5 rounded-xl bg-slate-50 p-3.5">
        {job ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <AppText type="label" className="truncate font-semibold">
                {job.status !== "IN_PROGRESS"
                  ? `Starts ${formatDate(job.starts_at)}`
                  : !working.length
                    ? "Engagement in progress"
                    : worksToday
                      ? "You're working today"
                      : "Day off today"}
              </AppText>
              <span className="text-muted-foreground truncate text-xs">
                {clientNameOf(job.client)}
              </span>
            </div>
            <div className="text-muted-foreground flex flex-wrap gap-x-3.5 gap-y-1 text-[12.5px]">
              {hours && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  {hours}
                </span>
              )}
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{job.pickup_address}</span>
              </span>
            </div>
            {job.status === "IN_PROGRESS" && job.today_attendance ? (
              <>
                <ShiftControl booking={job} className="pt-1" />
                <Link
                  href={`/driver/dashboard/job-request/${job.reference}`}
                  className="text-brand block text-center text-xs font-semibold"
                >
                  Open job & attendance
                </Link>
              </>
            ) : (
              <Button asChild className="h-9 w-full rounded-xl text-xs">
                <Link href={`/driver/dashboard/job-request/${job.reference}`}>
                  Open job
                </Link>
              </Button>
            )}
          </>
        ) : (
          <AppText type="caption" className="text-muted-foreground block">
            No engagement this week. Jobs you're hired for will show up here.
          </AppText>
        )}
      </div>
    </div>
  );
};
