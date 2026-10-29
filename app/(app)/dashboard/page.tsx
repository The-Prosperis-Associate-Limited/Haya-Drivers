"use client";

import { AppText } from "@/components/shared/app-text";
import { StatCard } from "@/components/shared/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { useGetProfile } from "@/hooks/use-get-profile";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn, formatMoney, greetingForNow } from "@/lib/utils";
import {
  ChevronRight,
  ClipboardList,
  Clock,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import type { APIResponse } from "@/types/response";
import type { OverviewData } from "@/types/booking";
import { ClientHero } from "./_components/client-hero";
import { HiredStaffTable } from "./_components/hired-staff-table";
import { InvoiceDueCard } from "./_components/invoice-due-card";
import { OnboardingPromptCard } from "./_components/onboarding-prompt-card";
import { RecentPaymentsCard } from "./_components/recent-payments-card";
import { RequestTracker } from "./_components/request-tracker";
import { SupportCard } from "./_components/support-card";
import { TopDriversCard } from "./_components/top-drivers-card";

const CARD =
  "border-border rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]";

const headlineFor = function (overview?: OverviewData) {
  if (!overview) return "Here's what's happening across your account.";

  const { invoice_due: due, stats } = overview;

  if (due?.status === "INVOICED")
    return `An invoice of ${formatMoney(due.invoice.total_minor, due.invoice.currency)} is waiting for payment on ${due.reference}.`;
  if (due?.status === "PAYMENT_REVIEW")
    return `We're confirming your transfer for ${due.reference} - your drivers' details unlock once it lands.`;
  if (stats.open_requests)
    return `We're working on ${stats.open_requests} open hire request${stats.open_requests > 1 ? "s" : ""} for you.`;
  if (stats.active_drivers)
    return "Everything is up to date. Your hired drivers and payments are below.";
  return "Tell us who you need and our team will shortlist vetted drivers for you.";
};

export default function DashboardOverview() {
  const { profile } = useGetProfile();

  const { data, isFetching } = useGetData<APIResponse<OverviewData>>({
    url: API_ENDPOINTS.dashboard.overview,
  });

  const overview = data?.data;
  const stats = overview?.stats;

  // An organisation is addressed by its company name everywhere on this surface.
  const displayName =
    profile?.client_profile?.organisation_name || profile?.first_name;

  const delta = stats?.spend_delta_percent ?? null;

  return (
    <div className="mx-auto max-w-[1360px] space-y-5 lg:space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-6">
        <ClientHero
          greeting={`${greetingForNow()}${displayName ? `, ${displayName}` : ""}`}
          headline={headlineFor(overview)}
          activeDrivers={stats?.active_drivers}
          onDuty={stats?.on_duty}
        />
        {overview ? (
          <InvoiceDueCard due={overview.invoice_due} />
        ) : (
          <Skeleton className="h-64 rounded-2xl" />
        )}
      </section>

      {profile && (
        <OnboardingPromptCard clientProfile={profile.client_profile ?? null} />
      )}

      <section className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        {!stats ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard
              icon={Users}
              label="Active drivers"
              value={stats.active_drivers}
              caption={
                stats.active_drivers ? "On your team now" : "No hires yet"
              }
              captionTone="muted"
              href="/dashboard/my-hire"
            />
            <StatCard
              icon={ClipboardList}
              tone="amber"
              label="Open hire requests"
              value={stats.open_requests}
              caption={
                stats.open_requests
                  ? "In progress with our team"
                  : "Nothing open"
              }
              captionTone="muted"
              href="/dashboard/my-hire"
            />
            <StatCard
              icon={Wallet}
              tone="green"
              label="Paid this month"
              value={formatMoney(stats.monthly_spend_minor, overview.currency)}
              caption={
                !stats.monthly_spend_minor && stats.spend_last_month_minor ? (
                  `${formatMoney(stats.spend_last_month_minor, overview.currency)} last month`
                ) : delta === null ? (
                  "Invoices paid to Haya Drivers"
                ) : (
                  <>
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-px text-[11.5px] font-semibold",
                        delta >= 0
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600",
                      )}
                    >
                      {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
                    </span>
                    vs last month
                  </>
                )
              }
              captionTone="muted"
            />
            <StatCard
              icon={Clock}
              tone="violet"
              label="Drivers on time"
              value={
                stats.on_time_rate === null ? "-" : `${stats.on_time_rate}%`
              }
              caption={
                stats.on_time_rate === null
                  ? "Measured from daily check-ins"
                  : "Check-ins across your team"
              }
              captionTone="muted"
            />
          </>
        )}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start xl:gap-6">
        <div className="min-w-0 space-y-5 xl:space-y-6">
          {overview ? (
            <RequestTracker
              request={overview.hire_requests[0]}
              moreCount={Math.max(0, stats!.open_requests - 1)}
            />
          ) : (
            <Skeleton className="h-80 rounded-2xl" />
          )}

          <div className={cn(CARD, "overflow-hidden")}>
            <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 md:px-5 md:pt-5">
              <div>
                <AppText type="h4" className="text-[15px] font-semibold">
                  Hired staff
                </AppText>
                <AppText type="caption" className="text-muted-foreground block">
                  Your drivers and today&apos;s check-ins
                </AppText>
              </div>
              <Link
                href="/dashboard/my-hire"
                className="text-brand inline-flex shrink-0 items-center gap-0.5 text-[13px] font-semibold"
              >
                {overview && overview.hired_total > overview.hired_staff.length
                  ? `All ${overview.hired_total}`
                  : "My hire"}
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {!overview && isFetching ? (
              <div className="space-y-3 p-4 md:p-5">
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
              </div>
            ) : !overview?.hired_staff.length ? (
              <AppText
                type="caption"
                className="text-muted-foreground block px-4 pb-5 md:px-5"
              >
                No hires yet - drivers appear here once their invoice is paid.
              </AppText>
            ) : (
              <HiredStaffTable hires={overview.hired_staff} />
            )}
          </div>
        </div>

        <div className="min-w-0 space-y-5 xl:space-y-6">
          {overview ? (
            <RecentPaymentsCard payments={overview.recent_payments} />
          ) : (
            <Skeleton className="h-56 rounded-2xl" />
          )}
          <TopDriversCard state={profile?.state_of_residence} />
          <SupportCard />
        </div>
      </section>
    </div>
  );
}
