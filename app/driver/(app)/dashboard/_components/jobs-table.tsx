import { AppText } from "@/components/shared/app-text";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_STYLES,
  clientNameOf,
  cn,
  driverTypeLabel,
  ENGAGEMENT_TYPE_LABELS,
  formatMoney,
  formatDate,
  getInitials,
  WORK_SCHEDULE_LABELS,
} from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Booking } from "@/types/booking";

interface Props {
  jobs: Booking[];
  showPay?: boolean;
}

const SHORT_SCHEDULE: Record<string, string> = {
  WEEKDAYS: "Mon - Fri",
  WEEKDAYS_AND_SATURDAY: "Mon - Sat",
  FULL_WEEK: "Mon - Sun",
};

const scheduleOf = (job: Booking) => {
  const days = job.schedule
    ? (SHORT_SCHEDULE[job.schedule] ?? WORK_SCHEDULE_LABELS[job.schedule])
    : null;
  const hours =
    job.resumption_time && job.closing_time
      ? `${job.resumption_time} - ${job.closing_time}`
      : null;

  return { days: days ?? `Starts ${formatDate(job.starts_at)}`, hours };
};

export const JobsTable = function ({ jobs, showPay }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead className="hidden md:table-header-group">
          <tr className="bg-slate-50 text-[11.5px] font-semibold tracking-wide text-slate-500 uppercase">
            <th className="px-5 py-2.5 font-semibold">Engagement</th>
            <th className="px-3 py-2.5 font-semibold">Schedule</th>
            <th className="px-3 py-2.5 font-semibold">Location</th>
            {showPay && <th className="px-3 py-2.5 font-semibold">Pay</th>}
            <th className="px-3 py-2.5 font-semibold">Status</th>
            <th className="py-2.5 pr-5 pl-2" />
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const { days, hours } = scheduleOf(job);

            return (
              <tr
                key={job.id}
                className="grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-slate-100 px-4 py-4 md:table-row md:px-0 md:py-0"
              >
                <td className="col-span-2 md:px-5 md:py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage
                        src={job.client.profile_pic ?? undefined}
                        alt=""
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials(
                          job.client.first_name,
                          job.client.last_name,
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "min-w-0",
                        showPay ? "md:max-w-[260px]" : "md:max-w-[180px]",
                      )}
                    >
                      <AppText
                        type="label"
                        className="block truncate text-[13.5px] font-semibold"
                      >
                        {clientNameOf(job.client)}
                      </AppText>
                      <AppText
                        type="caption"
                        className="text-muted-foreground block truncate"
                      >
                        {job.reference} · {driverTypeLabel(job.driver_type)}
                      </AppText>
                    </div>
                  </div>
                </td>
                <td className="text-[13px] md:px-3 md:py-3.5 md:whitespace-nowrap">
                  <span className="text-muted-foreground block text-[11px] md:hidden">
                    Schedule
                  </span>
                  {days}
                  {hours && (
                    <span className="text-muted-foreground block text-xs">
                      {hours}
                    </span>
                  )}
                </td>
                <td className="min-w-0 text-[13px] md:px-3 md:py-3.5">
                  <span className="text-muted-foreground block text-[11px] md:hidden">
                    Location
                  </span>
                  <span className="block truncate md:max-w-[140px]">
                    {job.pickup_address}
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    {job.state}
                  </span>
                </td>
                {showPay && (
                  <td className="text-[13px] md:px-3 md:py-3.5 md:whitespace-nowrap">
                    <span className="text-muted-foreground block text-[11px] md:hidden">
                      Pay
                    </span>
                    <span className="font-semibold">
                      {formatMoney(job.amount, job.currency)}
                    </span>
                    <span className="text-muted-foreground block text-xs">
                      {ENGAGEMENT_TYPE_LABELS[job.engagement_type]}
                    </span>
                  </td>
                )}
                <td className="md:px-3 md:py-3.5">
                  <StatusBadge
                    label={BOOKING_STATUS_LABELS[job.status]}
                    className={cn(
                      "whitespace-nowrap",
                      BOOKING_STATUS_STYLES[job.status],
                    )}
                  />
                </td>
                <td className="col-span-2 md:py-3.5 md:pr-5 md:pl-2 md:text-right">
                  <Button
                    asChild
                    variant={job.status === "ACCEPTED" ? "default" : "outline"}
                    className="h-9 w-full rounded-xl px-4 text-xs md:size-9 md:p-0"
                  >
                    <Link
                      href={`/driver/dashboard/job-request/${job.reference}`}
                    >
                      <span className="md:sr-only">Open job</span>
                      <ChevronRight className="hidden size-4 md:block" />
                    </Link>
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
