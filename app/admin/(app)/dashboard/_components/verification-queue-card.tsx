"use client";

import { AppText } from "@/components/shared/app-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { PaginatedResponse } from "@/types/response";
import type { VerificationQueueRow } from "@/types/admin";

export const VerificationQueueCard = function () {
  const { data, isFetching } = useGetData<
    PaginatedResponse<VerificationQueueRow>
  >({
    url: API_ENDPOINTS.adminVerifications.queue({
      page: 1,
      limit: 3,
      status: "PENDING",
    }),
  });

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <AppText type="h4" className="text-[15px] font-semibold">
            Verification queue
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            {total
              ? `${total} driver${total > 1 ? "s" : ""} waiting`
              : "Nobody waiting"}
          </AppText>
        </div>
        <Link
          href="/admin/dashboard/drivers#verification"
          className="text-brand inline-flex shrink-0 items-center gap-0.5 text-[13px] font-semibold"
        >
          See all
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-3 divide-y divide-slate-100">
        {isFetching && !data ? (
          <Skeleton className="h-28 w-full rounded-xl" />
        ) : !rows.length ? (
          <AppText
            type="caption"
            className="text-muted-foreground block py-4 text-center"
          >
            Every submitted driver has been reviewed.
          </AppText>
        ) : (
          rows.map((row) => {
            const documents = row.user.documents ?? [];
            const name =
              [row.user.first_name, row.user.last_name]
                .filter(Boolean)
                .join(" ") || row.user.email;

            return (
              <div key={row.id} className="flex items-center gap-3 py-2.5">
                <Avatar className="size-9 shrink-0">
                  <AvatarImage src={row.user.profile_pic ?? undefined} alt="" />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(row.user.first_name, row.user.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
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
                    {documents.length} document
                    {documents.length === 1 ? "" : "s"}
                    {row.submitted_at
                      ? ` · ${formatRelativeTime(row.submitted_at)}`
                      : ""}
                    {row.attempts > 1 ? " · resubmitted" : ""}
                  </AppText>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="h-8 shrink-0 rounded-lg px-3 text-xs"
                >
                  <Link
                    href={`/admin/dashboard/drivers/${row.userId}?tab=documents`}
                  >
                    Review
                  </Link>
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
