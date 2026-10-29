"use client";

import { AppTabs } from "@/components/shared/app-tabs";
import { AppText } from "@/components/shared/app-text";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { useGetData } from "@/hooks/use-get-data";
import { useGetProfile } from "@/hooks/use-get-profile";
import { downloadCsv } from "@/lib/admin";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn, formatMoney, greetingForNow } from "@/lib/utils";
import { ClipboardList, Download, UsersRound, Car, Wallet } from "lucide-react";
import { useState } from "react";
import type { AdminOverview, OverviewPeriod } from "@/types/admin";
import type { APIResponse } from "@/types/response";
import { ActionTiles } from "./_components/action-tiles";
import { GrowthChart } from "./_components/growth-chart";
import { InvoicesPaidCard } from "./_components/invoices-paid-card";
import { NeedsActionTable } from "./_components/needs-action-table";
import { PipelineCard } from "./_components/pipeline-card";
import { RecentActivityCard } from "./_components/recent-activity-card";
import { SupportInboxCard } from "./_components/support-inbox-card";
import { VerificationQueueCard } from "./_components/verification-queue-card";
import { VisitorsChart } from "./_components/visitors-chart";

const PERIODS: { value: OverviewPeriod; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

const Delta = function ({ value }: { value: number | null }) {
  if (value === null) return null;

  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-px text-[11.5px] font-semibold",
        value >= 0
          ? "bg-emerald-50 text-emerald-600"
          : "bg-red-50 text-red-600",
      )}
    >
      {value >= 0 ? "▲" : "▼"} {Math.abs(value)}%
    </span>
  );
};

export default function AdminOverviewPage() {
  const { profile } = useGetProfile();
  const [period, setPeriod] = useState<OverviewPeriod>("30d");

  const { data } = useGetData<APIResponse<AdminOverview>>({
    url: API_ENDPOINTS.adminDashboard.overview(period),
    staleTime: 60 * 1000,
  });

  const overview = data?.data;
  const stats = overview?.stats;
  const days = period.replace("d", "");
  const versus = `vs previous ${days} days`;

  const exportPeriod = () => {
    if (!overview || !stats) return;

    downloadCsv(
      `haya-drivers-overview-${period}.csv`,
      ["Metric", "Value"],
      [
        ["Period", `Last ${days} days`],
        ["Total users", stats.total_users],
        ["New users in period", stats.new_users],
        ["Active drivers", stats.active_drivers],
        ["Drivers approved in period", stats.approved_in_period],
        ["Open hire requests", stats.open_hire_requests],
        ["Avg hours to first shortlist", stats.avg_hours_to_shortlist ?? ""],
        [
          "Invoices paid in period",
          formatMoney(stats.invoices_paid_minor, stats.currency),
        ],
        [
          "Service fees in period",
          formatMoney(stats.fees_minor, stats.currency),
        ],
        ["Pipeline: new requests", overview.pipeline.new],
        ["Pipeline: shortlisting", overview.pipeline.shortlisting],
        ["Pipeline: ready to invoice", overview.pipeline.ready_to_invoice],
        ["Pipeline: invoiced", overview.pipeline.invoiced],
        ["Pipeline: payment review", overview.pipeline.payment_review],
        ["Active hires", overview.pipeline.active_hires],
      ],
    );
  };

  return (
    <div className="mx-auto max-w-[1360px] space-y-5 lg:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <AppText
            type="h2"
            className="text-[22px] font-semibold tracking-tight"
          >
            <span suppressHydrationWarning>{greetingForNow()}</span>
            {profile?.first_name ? `, ${profile.first_name}` : ""}
          </AppText>
          <AppText
            type="subtitle"
            className="text-muted-foreground text-[13px]"
          >
            Here&apos;s what needs the team&apos;s attention today.
          </AppText>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AppTabs
            tabs={PERIODS}
            value={period}
            onValueChange={setPeriod}
            variant="compact"
          />
          <Button
            variant="outline"
            className="h-9 rounded-xl text-xs"
            disabled={!overview}
            onClick={exportPeriod}
          >
            <Download className="size-3.5" />
            Export
          </Button>
        </div>
      </div>

      <ActionTiles tiles={overview?.tiles} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        <StatCard
          icon={UsersRound}
          label="Total users"
          value={stats ? stats.total_users.toLocaleString() : "-"}
          caption={
            stats ? (
              <>
                <Delta value={stats.new_users_delta_percent} />
                {stats.new_users} new in {days} days
              </>
            ) : (
              " "
            )
          }
          captionTone="muted"
        />
        <StatCard
          icon={Car}
          tone="green"
          label="Active drivers"
          value={stats ? stats.active_drivers.toLocaleString() : "-"}
          caption={
            stats
              ? `+${stats.approved_in_period} approved in ${days} days`
              : " "
          }
          captionTone="muted"
          href="/admin/dashboard/drivers"
        />
        <StatCard
          icon={ClipboardList}
          tone="amber"
          label="Open hire requests"
          value={stats ? stats.open_hire_requests : "-"}
          caption={
            stats
              ? stats.avg_hours_to_shortlist === null
                ? "No shortlists in this period"
                : `Avg. ${stats.avg_hours_to_shortlist}h to shortlist`
              : " "
          }
          captionTone="muted"
          href="/admin/dashboard/hires"
        />
        <StatCard
          icon={Wallet}
          tone="violet"
          label="Invoices paid"
          value={
            stats ? formatMoney(stats.invoices_paid_minor, stats.currency) : "-"
          }
          caption={
            stats ? (
              <>
                <Delta value={stats.invoices_paid_delta_percent} />
                {stats.invoices_paid_delta_percent === null
                  ? `${formatMoney(stats.fees_minor, stats.currency)} in service fees`
                  : `${versus} · ${formatMoney(stats.fees_minor, stats.currency)} fees`}
              </>
            ) : (
              " "
            )
          }
          captionTone="muted"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start xl:gap-6">
        <div className="min-w-0 space-y-5 xl:space-y-6">
          <PipelineCard pipeline={overview?.pipeline} />
          <NeedsActionTable
            hires={overview?.needs_action}
            total={overview?.needs_action_total}
          />
          <InvoicesPaidCard
            series={overview?.invoices_paid_series}
            currency={stats?.currency}
          />
          <GrowthChart />
          <VisitorsChart />
        </div>

        <div className="min-w-0 space-y-5 xl:space-y-6">
          <VerificationQueueCard />
          <SupportInboxCard />
          <RecentActivityCard />
        </div>
      </div>
    </div>
  );
}
