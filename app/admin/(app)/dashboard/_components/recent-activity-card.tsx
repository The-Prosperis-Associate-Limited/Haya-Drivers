"use client";

import { AppText } from "@/components/shared/app-text";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { AdminActivityRow } from "@/types/admin";
import type { APIResponse } from "@/types/response";

const PIN: Record<string, string> = {
  VERIFICATION_APPROVED: "bg-emerald-500",
  BOOKING_COMPLETED: "bg-emerald-500",
  PAYOUT_PAID: "bg-emerald-500",
  VERIFICATION_REJECTED: "bg-red-500",
  PAYOUT_FAILED: "bg-red-500",
  ACCOUNT_SUSPENDED: "bg-red-500",
  BOOKING_CANCELLED: "bg-amber-500",
  ONBOARDING_SUBMITTED: "bg-amber-500",
  DOCUMENT_UPLOADED: "bg-amber-500",
  PAYOUT_REQUESTED: "bg-amber-500",
};

export const RecentActivityCard = function () {
  const { data, isFetching } = useGetData<APIResponse<AdminActivityRow[]>>({
    url: API_ENDPOINTS.adminDashboard.activities({ limit: 6 }),
    staleTime: 60 * 1000,
  });

  const activities = data?.data ?? [];

  return (
    <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
      <AppText type="h4" className="text-[15px] font-semibold">
        Recent activity
      </AppText>

      {isFetching && !data ? (
        <Skeleton className="mt-4 h-40 w-full rounded-xl" />
      ) : !activities.length ? (
        <AppText
          type="caption"
          className="text-muted-foreground block py-4 text-center"
        >
          Nothing has happened yet.
        </AppText>
      ) : (
        <ol className="mt-4">
          {activities.map((activity, index) => {
            const who = [activity.user?.first_name, activity.user?.last_name]
              .filter(Boolean)
              .join(" ");

            return (
              <li
                key={activity.id}
                className="relative flex gap-3 pb-4 last:pb-0"
              >
                {index < activities.length - 1 && (
                  <span className="absolute top-4 bottom-0 left-[5px] w-px bg-slate-200" />
                )}
                <span
                  className={cn(
                    "relative mt-1 size-[11px] shrink-0 rounded-full ring-4 ring-white",
                    PIN[activity.type] ?? "bg-brand",
                  )}
                />
                <div className="min-w-0">
                  <AppText
                    type="label"
                    className="block text-[13px] font-medium"
                  >
                    {who && <span className="font-semibold">{who} · </span>}
                    {activity.title}
                  </AppText>
                  <AppText
                    type="caption"
                    className="text-muted-foreground block"
                  >
                    {formatRelativeTime(activity.createdAt)}
                    {activity.description ? ` · ${activity.description}` : ""}
                    {activity.user?.role
                      ? ` · ${activity.user.role.toLowerCase()}`
                      : ""}
                  </AppText>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};
