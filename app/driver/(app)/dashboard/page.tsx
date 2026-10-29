"use client";

import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProfile } from "@/hooks/use-get-profile";
import {
  cn,
  formatMoney,
  greetingForNow,
  TRANSMISSION_OPTIONS,
  VERIFICATION_COPY,
} from "@/lib/utils";
import { Briefcase, ChevronRight, Clock, Star, Wallet } from "lucide-react";
import Link from "next/link";
import {
  useEarningsSummary,
  useEarningsTrend,
} from "./earnings/_hooks/use-earnings";
import { useDashboardStats, useUpcomingJobs } from "./_hooks/use-dashboard";
import { AttentionCard } from "./_components/attention-card";
import { EarningsCard } from "./_components/earnings-card";
import { JobsTable } from "./_components/jobs-table";
import { OverallProgressCard } from "./_components/overall-progress-card";
import { RecentReviewsCard } from "./_components/recent-reviews-card";
import { ShortlistCard } from "./_components/shortlist-card";
import { TrustScoreCard } from "./_components/trust-score-card";
import { WeekCard } from "./_components/week-card";
import { WelcomeHero } from "./_components/welcome-hero";

export default function Overview() {
  const { profile } = useGetProfile();
  const { stats, isFetching } = useDashboardStats();
  const { jobs, isFetching: isFetchingJobs } = useUpcomingJobs();

  const driverProfile = profile?.driver_profile;
  const status = driverProfile?.verification_status ?? "UNSUBMITTED";
  const isVerified = status === "APPROVED";
  const location = [profile?.city, profile?.state_of_residence]
    .filter(Boolean)
    .join(", ");

  const { summary, isFetching: isFetchingSummary } =
    useEarningsSummary(isVerified);
  const { trend } = useEarningsTrend(isVerified);

  const currency = summary?.currency ?? stats?.currency ?? "NGN";
  const thisMonth = trend.at(-1)?.total_minor ?? 0;
  const lastMonth = trend.at(-2)?.total_minor ?? 0;
  // A month-on-month change only exists when there was a last month to compare.
  const monthDelta = lastMonth
    ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
    : null;

  const reviewCount = stats?.client_review_count ?? 0;
  const onTime = stats?.on_time_rate ?? null;

  return (
    <div className="mx-auto max-w-[1360px] space-y-5 lg:space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-6">
        <WelcomeHero
          greeting={`${greetingForNow()}, ${profile?.first_name ?? "there"} 👋`}
          headline={
            isVerified && profile?.state_of_residence
              ? `You're verified and visible to clients across ${profile.state_of_residence}.`
              : VERIFICATION_COPY[status].headline
          }
          isVerified={isVerified}
          openToWork={driverProfile?.open_to_work ?? true}
          transmission={
            TRANSMISSION_OPTIONS.find(
              (option) => option.value === driverProfile?.transmission,
            )?.label
          }
          location={location}
          yearsOfExperience={driverProfile?.years_of_experience}
        />
        {isVerified ? (
          <TrustScoreCard />
        ) : (
          <OverallProgressCard status={status} />
        )}
      </section>

      <AttentionCard status={status} />

      {isVerified && <ShortlistCard />}

      <section className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        {isFetching && !stats ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard
              icon={Briefcase}
              label="Ongoing jobs"
              value={stats?.ongoing_projects ?? 0}
              caption={
                stats?.ongoing_projects
                  ? `${stats.jobs_completed} completed so far`
                  : "No active engagement"
              }
              captionTone="muted"
              href="/driver/dashboard/job-request"
            />
            <StatCard
              icon={Wallet}
              tone="green"
              label="Earned this month"
              value={isVerified ? formatMoney(thisMonth, currency) : "-"}
              caption={
                !isVerified ? (
                  "After verification"
                ) : !thisMonth && lastMonth ? (
                  `${formatMoney(lastMonth, currency)} last month`
                ) : monthDelta === null ? (
                  "Nothing to compare yet"
                ) : (
                  <>
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-px text-[11.5px] font-semibold",
                        monthDelta >= 0
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600",
                      )}
                    >
                      {monthDelta >= 0 ? "▲" : "▼"} {Math.abs(monthDelta)}%
                    </span>
                    vs last month
                  </>
                )
              }
              captionTone="muted"
              href={isVerified ? "/driver/dashboard/earnings" : undefined}
            />
            <StatCard
              icon={Clock}
              tone="violet"
              label="On-time rate"
              value={onTime === null ? "-" : `${onTime}%`}
              caption={
                onTime === null
                  ? "Measured from your daily check-ins"
                  : "Your last 50 check-ins"
              }
              captionTone="muted"
            />
            <StatCard
              icon={Star}
              tone="amber"
              label="Client rating"
              value={
                reviewCount ? (
                  <>
                    {stats?.client_review_average.toFixed(1)}
                    <span className="text-muted-foreground text-sm font-medium">
                      {" "}
                      / 5
                    </span>
                  </>
                ) : (
                  "-"
                )
              }
              caption={
                reviewCount
                  ? `From ${reviewCount} verified review${reviewCount > 1 ? "s" : ""}`
                  : "No reviews yet"
              }
              captionTone="muted"
              href="/driver/dashboard/reviews"
            />
          </>
        )}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start xl:gap-6">
        <div className="min-w-0 space-y-5 xl:space-y-6">
          <div className="border-border overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 md:px-5 md:pt-5">
              <div>
                <AppText type="h4" className="text-[15px] font-semibold">
                  Current &amp; upcoming jobs
                </AppText>
                <AppText type="caption" className="text-muted-foreground block">
                  Open a job to start or complete it
                </AppText>
              </div>
              <Link
                href="/driver/dashboard/job-request"
                className="text-brand inline-flex shrink-0 items-center gap-0.5 text-[13px] font-semibold"
              >
                My jobs
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {isFetchingJobs && !jobs.length ? (
              <div className="space-y-3 p-4 md:p-5">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : !jobs.length ? (
              <div className="px-4 pb-4">
                <EmptyState
                  illustration="/empty-jobs.svg"
                  title="You have no upcoming jobs yet."
                  description={
                    isVerified
                      ? "Jobs you're hired for will show up here."
                      : "Complete your verification to start receiving jobs"
                  }
                  action={
                    !isVerified &&
                    status !== "REJECTED" && (
                      <Button asChild className="h-11 rounded-lg px-6">
                        <Link href="/driver/dashboard/settings">
                          Get started
                        </Link>
                      </Button>
                    )
                  }
                />
              </div>
            ) : (
              <JobsTable jobs={jobs} />
            )}
          </div>

          {isVerified && (
            <EarningsCard
              summary={summary}
              trend={trend}
              isFetching={isFetchingSummary}
            />
          )}
        </div>

        <div className="min-w-0 space-y-5 xl:space-y-6">
          <WeekCard
            job={
              jobs.find(
                (job) => job.status === "IN_PROGRESS" && job.schedule,
              ) ?? jobs[0]
            }
          />
          <RecentReviewsCard />
        </div>
      </section>
    </div>
  );
}
