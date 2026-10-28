"use client";

import { AppTabs } from "@/components/shared/app-tabs";
import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { StatCard } from "@/components/shared/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProfile } from "@/hooks/use-get-profile";
import { Briefcase, CircleCheckBig, Clock, Star } from "lucide-react";
import { useState } from "react";
import { JobsTable } from "../_components/jobs-table";
import { useDashboardStats } from "../_hooks/use-dashboard";
import { UnverifiedNotice } from "./_components/unverified-notice";
import {
  useJobRequestSummary,
  useJobRequests,
} from "./_hooks/use-job-requests";
import type { JobRequestBucket } from "@/types/booking";

/*
  The bucket names only - the server owns which statuses each one covers, so a
  job cannot be counted under one tab and listed under another. Jobs arrive
  already accepted (the platform brokers every hire), so the tabs track the
  engagement lifecycle rather than a request inbox.
*/
const TABS: {
  value: JobRequestBucket;
  label: string;
  empty: string;
  emptyHint: string;
}[] = [
  {
    value: "active",
    label: "Active",
    empty: "No active jobs right now",
    emptyHint:
      "When a client hires you, the engagement lands here - start it on day one and it runs until completion.",
  },
  {
    value: "completed",
    label: "Completed",
    empty: "You have not completed any jobs yet",
    emptyHint: "Finished engagements stay here for your records.",
  },
];

const LIMIT = 10;

export default function JobRequests() {
  const [tab, setTab] = useState<JobRequestBucket>("active");
  const [page, setPage] = useState(1);

  const active = TABS.find((entry) => entry.value === tab) ?? TABS[0];

  const { profile } = useGetProfile();
  const status = profile?.driver_profile?.verification_status;
  const isVerified = status === "APPROVED";

  const { summary } = useJobRequestSummary(isVerified);
  const { stats } = useDashboardStats();

  const { bookings, totalPages, isFetching } = useJobRequests({
    page,
    limit: LIMIT,
    bucket: active.value,
    shouldFetch: isVerified,
  });

  const counts: Record<JobRequestBucket, number | undefined> = {
    active: summary?.active,
    completed: summary?.completed,
  };

  const onTime = stats?.on_time_rate ?? null;
  const reviewCount = stats?.client_review_count ?? 0;

  return (
    <div className="mx-auto max-w-[1360px] space-y-5 lg:space-y-6">
      <PageHeader
        title="My jobs"
        subtitle="Engagements clients have hired you for. Start each job on day one and mark it complete when it ends."
      />

      {profile && !isVerified ? (
        <UnverifiedNotice status={status ?? "UNSUBMITTED"} />
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
            <StatCard
              icon={Briefcase}
              label="Active jobs"
              value={summary?.active ?? 0}
              caption="Running or about to start"
              captionTone="muted"
            />
            <StatCard
              icon={CircleCheckBig}
              tone="green"
              label="Completed"
              value={summary?.completed ?? 0}
              caption="Finished engagements"
              captionTone="muted"
            />
            <StatCard
              icon={Clock}
              tone="violet"
              label="On-time rate"
              value={onTime === null ? "-" : `${onTime}%`}
              caption={
                onTime === null
                  ? "Measured once you start a job"
                  : "Start stamps against the scheduled time"
              }
              captionTone="muted"
            />
            <StatCard
              icon={Star}
              tone="amber"
              label="Client rating"
              value={
                reviewCount
                  ? `${stats?.client_review_average.toFixed(1)} / 5`
                  : "-"
              }
              caption={
                reviewCount
                  ? `From ${reviewCount} verified review${reviewCount > 1 ? "s" : ""}`
                  : "No reviews yet"
              }
              captionTone="muted"
              href="/driver/dashboard/reviews"
            />
          </section>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            limit={LIMIT}
            isLoading={isFetching}
          >
            <div className="border-border overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-3 md:px-5 md:pt-5">
                <div>
                  <AppText type="h4" className="text-[15px] font-semibold">
                    {active.label} jobs
                  </AppText>
                  <AppText
                    type="caption"
                    className="text-muted-foreground block"
                  >
                    Open a job to start it, complete it or call the client
                  </AppText>
                </div>
                <AppTabs
                  variant="chip"
                  value={tab}
                  onValueChange={(value) => {
                    setTab(value);
                    setPage(1);
                  }}
                  tabs={TABS.map((entry) => ({
                    value: entry.value,
                    label:
                      counts[entry.value] === undefined
                        ? entry.label
                        : `${entry.label} (${counts[entry.value]})`,
                  }))}
                />
              </div>

              {isFetching && !bookings.length ? (
                <div className="space-y-3 p-4 md:p-5">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              ) : !bookings.length ? (
                <EmptyState
                  illustration="/empty-jobs.svg"
                  title={active.empty}
                  description={active.emptyHint}
                />
              ) : (
                <JobsTable jobs={bookings} showPay />
              )}
            </div>
          </Pagination>
        </>
      )}
    </div>
  );
}
