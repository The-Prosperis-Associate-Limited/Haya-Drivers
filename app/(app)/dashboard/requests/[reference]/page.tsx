"use client";

import { TalentCard } from "@/components/drivers/talent-card";
import { AppText } from "@/components/shared/app-text";
import { BackLink } from "@/components/shared/back-link";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn, formatMoney, HIRE_ENGAGEMENT_LABELS } from "@/lib/utils";
import { SearchX } from "lucide-react";
import { use, useState } from "react";
import type { DriverSearchResult } from "@/types/driver";
import type { APIResponse } from "@/types/response";
import type { StaffingRequest } from "@/types/request";

const PAGE_SIZE = 6;

// The server still returns applicants; the UI ignores them until the
// driver-apply design is resolved (clients scout, drivers don't apply).
interface MatchesPayload {
  request: StaffingRequest;
  matched: {
    data: DriverSearchResult[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export default function RequestMatches({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = use(params);
  const [page, setPage] = useState(1);

  const { data, isFetching } = useGetData<APIResponse<MatchesPayload>>({
    url: API_ENDPOINTS.requests.matches(reference, {
      page,
      limit: PAGE_SIZE,
    }),
  });

  const payload = data?.data;
  const request = payload?.request;
  const matched = payload?.matched;

  return (
    <div className="mx-auto max-w-[1360px]">
      <BackLink href="/dashboard/requests" label="Back to requests" />

      {!request ? (
        <div className="mt-4 space-y-4">
          {isFetching && (
            <>
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-[420px] rounded-2xl" />
            </>
          )}
        </div>
      ) : (
        <>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <AppText
                type="h2"
                className="text-[22px] font-semibold tracking-tight"
              >
                {request.title}
              </AppText>
              <AppText
                type="caption"
                className="text-muted-foreground mt-1 block text-sm"
              >
                {[
                  [request.city, request.state].filter(Boolean).join(", "),
                  HIRE_ENGAGEMENT_LABELS[request.engagement_type],
                  `${formatMoney(request.budget, request.currency)} / month`,
                  request.preferred_ethnicity,
                  request.preferred_religion,
                  request.preferred_age_range &&
                    `Age ${request.preferred_age_range}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </AppText>
            </div>
            <span
              className={cn(
                "shrink-0 self-start rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide uppercase",
                request.status === "OPEN"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {request.status === "OPEN" ? "Open" : "Closed"}
            </span>
          </div>

          <section className="mt-8">
            <AppText type="h3" className="text-[15px] font-semibold">
              Matched drivers
            </AppText>
            <AppText
              type="caption"
              className="text-muted-foreground mt-1 block text-sm"
            >
              Verified drivers who fit this request&apos;s category, location
              and budget.
            </AppText>

            {isFetching && !matched?.data.length ? (
              <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-[230px] rounded-2xl" />
                ))}
              </div>
            ) : !matched?.data.length ? (
              <EmptyState
                icon={SearchX}
                title="No matches yet"
                description="No verified driver fits these criteria right now - new drivers are verified every week."
                className="mt-6"
              />
            ) : (
              <Pagination
                page={page}
                totalPages={matched.totalPages}
                total={matched.total}
                onPageChange={setPage}
                isLoading={isFetching}
                className="mt-4"
              >
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {matched.data.map((driver) => (
                    <TalentCard key={driver.id} driver={driver} />
                  ))}
                </div>
              </Pagination>
            )}
          </section>
        </>
      )}
    </div>
  );
}
