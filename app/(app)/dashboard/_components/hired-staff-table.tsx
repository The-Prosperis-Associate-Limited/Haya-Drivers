import { AppText } from "@/components/shared/app-text";
import { TrustRing } from "@/components/drivers/trust-ring";
import { TodayAttendanceBadge } from "@/components/attendance/today-attendance-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  cn,
  driverTypeLabel,
  ENGAGEMENT_TYPE_LABELS,
  formatDate,
  formatMoney,
} from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Hire } from "@/types/booking";

interface Props {
  hires: Hire[];
}

const statusOf = function (hire: Hire) {
  if (hire.status === "IN_PROGRESS")
    return {
      label: "Working",
      tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  if (new Date(hire.starts_at) > new Date())
    return {
      label: `Starts ${formatDate(hire.starts_at)}`,
      tone: "border-brand/20 bg-brand-soft text-brand",
    };
  return {
    label: "Awaiting start",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
  };
};

export const HiredStaffTable = function ({ hires }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead className="hidden md:table-header-group">
          <tr className="bg-slate-50 text-[11.5px] font-semibold tracking-wide text-slate-500 uppercase">
            <th className="px-5 py-2.5 font-semibold">Driver</th>
            <th className="px-3 py-2.5 font-semibold">Engagement</th>
            <th className="px-3 py-2.5 font-semibold">Today</th>
            <th className="px-3 py-2.5 font-semibold">Salary</th>
            <th className="py-2.5 pr-5 pl-2" />
          </tr>
        </thead>
        <tbody>
          {hires.map((hire) => {
            const status = statusOf(hire);
            const name =
              [hire.driver?.first_name, hire.driver?.last_name]
                .filter(Boolean)
                .join(" ") || "Driver";

            return (
              <tr
                key={hire.id}
                className="grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-slate-100 px-4 py-4 md:table-row md:px-0 md:py-0"
              >
                <td className="col-span-2 md:px-5 md:py-3">
                  <div className="flex items-center gap-3">
                    <TrustRing
                      score={hire.driver?.driver_profile?.trust_score ?? 0}
                      size={44}
                      label={null}
                      valueClassName="text-[13px]"
                    />
                    <div className="min-w-0 md:max-w-[200px]">
                      <AppText
                        type="label"
                        className="block truncate text-[13.5px] font-semibold"
                      >
                        {name}
                      </AppText>
                      <AppText
                        type="caption"
                        className="text-muted-foreground block truncate"
                      >
                        {hire.reference}
                      </AppText>
                    </div>
                  </div>
                </td>
                <td className="text-[13px] md:px-3 md:py-3">
                  <span className="text-muted-foreground block text-[11px] md:hidden">
                    Engagement
                  </span>
                  {driverTypeLabel(hire.driver_type)}
                  <span className="text-muted-foreground block text-xs">
                    {ENGAGEMENT_TYPE_LABELS[hire.engagement_type]} · since{" "}
                    {formatDate(hire.starts_at)}
                  </span>
                </td>
                <td className="md:px-3 md:py-3">
                  <span className="text-muted-foreground mb-1 block text-[11px] md:hidden">
                    Today
                  </span>
                  {hire.today_attendance ? (
                    <TodayAttendanceBadge today={hire.today_attendance} />
                  ) : (
                    <StatusBadge
                      label={status.label}
                      className={cn("whitespace-nowrap", status.tone)}
                    />
                  )}
                </td>
                <td className="text-[13px] md:px-3 md:py-3 md:whitespace-nowrap">
                  <span className="text-muted-foreground block text-[11px] md:hidden">
                    Salary
                  </span>
                  <span className="font-semibold">
                    {formatMoney(hire.amount, hire.currency)}
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    {hire.engagement_type === "MONTHLY"
                      ? "per month"
                      : "per contract"}
                  </span>
                </td>
                <td className="col-span-2 md:py-3 md:pr-5 md:pl-2 md:text-right">
                  <Button
                    asChild
                    variant="outline"
                    className="h-9 w-full rounded-xl px-4 text-xs md:size-9 md:p-0"
                  >
                    <Link
                      href={`/dashboard/my-hire/${hire.reference}`}
                      aria-label={`View ${name}`}
                    >
                      <span className="md:sr-only">View hire</span>
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
