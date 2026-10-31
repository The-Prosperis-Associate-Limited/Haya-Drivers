"use client";

import { AppTabs } from "@/components/shared/app-tabs";
import { AppText } from "@/components/shared/app-text";
import { StatCard } from "@/components/shared/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn, formatMoneyCompact } from "@/lib/utils";
import type { AdminReferralOverview, ReferralLeader, ReferralNetwork as Network } from "@/types/referral";
import type { APIResponse } from "@/types/response";
import { CheckCheck, Gift, ShieldAlert, UsersRound, Wallet } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { NetworkLegend, ReferralNetwork } from "./_components/referral-network";
import { ReferralReviewDialog } from "./_components/referral-review-dialog";
import { ReferralsTable } from "./_components/referrals-table";
import { ReferrerSheet } from "./_components/referrer-sheet";
import { WeeklySignupsChart } from "./_components/weekly-signups-chart";

type Range = "7d" | "30d" | "90d" | "all";

const card = "border-border rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]";

function ReferralsDashboard() {
  const [range, setRange] = useState<Range>("30d");
  const [scope, setScope] = useState<"6" | "50">("6");
  const [driverId, setDriverId] = useState<string | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(useSearchParams().get("review"));

  const { data: overviewData } = useGetData<APIResponse<AdminReferralOverview>>({ url: API_ENDPOINTS.adminReferrals.overview(range) });
  const { data: networkData, isFetching: networkLoading } = useGetData<APIResponse<Network>>({ url: API_ENDPOINTS.adminReferrals.network(Number(scope)) });
  const { data: leaderData } = useGetData<APIResponse<ReferralLeader[]>>({ url: API_ENDPOINTS.adminReferrals.leaderboard(8) });

  const overview = overviewData?.data;
  const leaders = leaderData?.data ?? [];
  const topRewarded = Math.max(1, ...leaders.map((leader) => leader.rewarded));
  const funnelTop = Math.max(1, overview?.funnel[0]?.count ?? 1);

  return (
    <div className="mx-auto max-w-[1360px] space-y-5 lg:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <AppText type="h2" className="text-[22px] font-semibold tracking-tight">
            Referrals
          </AppText>
          <AppText type="subtitle" className="text-muted-foreground text-[13px]">
            Who brought whom onto the platform, what it cost, and which rewards need a second look.
          </AppText>
        </div>
        <AppTabs
          variant="compact"
          value={range}
          onValueChange={setRange}
          tabs={[
            { value: "7d", label: "7 days" },
            { value: "30d", label: "30 days" },
            { value: "90d", label: "90 days" },
            { value: "all", label: "All time" },
          ]}
        />
      </div>

      <section className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        {!overview ? (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36 rounded-2xl" />)
        ) : (
          <>
            <StatCard
              icon={UsersRound}
              label="Referred sign-ups"
              value={overview.kpis.signups}
              caption={
                overview.kpis.signups_change_pct === null
                  ? "No earlier period to compare"
                  : `${overview.kpis.signups_change_pct >= 0 ? "▲" : "▼"} ${Math.abs(overview.kpis.signups_change_pct)}% vs previous period`
              }
              captionTone={overview.kpis.signups_change_pct !== null && overview.kpis.signups_change_pct < 0 ? "warning" : overview.kpis.signups_change_pct === null ? "muted" : "positive"}
            />
            <StatCard
              icon={CheckCheck}
              tone="green"
              label="Submitted"
              value={overview.kpis.qualified}
              caption={`${overview.kpis.conversion_pct}% of referred sign-ups`}
              captionTone="muted"
            />
            <StatCard
              icon={Wallet}
              tone="violet"
              label="Rewards paid"
              value={formatMoneyCompact(overview.kpis.rewards_paid_minor, overview.currency)}
              caption="Net of reversals"
              captionTone="muted"
            />
            <StatCard
              icon={overview.kpis.held_for_review ? ShieldAlert : Gift}
              tone="amber"
              label={overview.kpis.held_for_review ? "Held for review" : "Active referrers"}
              value={overview.kpis.held_for_review || overview.kpis.active_referrers}
              caption={overview.kpis.held_for_review ? `${overview.kpis.active_referrers} active referrers` : "Drivers with at least one referral"}
              captionTone={overview.kpis.held_for_review ? "warning" : "muted"}
            />
          </>
        )}
      </section>

      <section className="grid gap-5 xl:grid-cols-2 xl:gap-6">
        <div className={cn(card, "p-4 md:p-5")}>
          <AppText type="h4" className="text-[15px] font-semibold">
            Referred sign-ups per week
          </AppText>
          <AppText type="caption" className="text-muted-foreground mb-5 block">
            Last 12 weeks · hover a bar for the count
          </AppText>
          {overview ? <WeeklySignupsChart weekly={overview.weekly} /> : <Skeleton className="h-48 rounded-xl" />}
        </div>

        <div className={cn(card, "p-4 md:p-5")}>
          <AppText type="h4" className="text-[15px] font-semibold">
            Referral funnel
          </AppText>
          <AppText type="caption" className="text-muted-foreground mb-5 block">
            Where referred drivers drop off, for sign-ups in this period
          </AppText>
          <div className="space-y-3">
            {(overview?.funnel ?? []).map((step) => (
              <div key={step.key} className="grid grid-cols-[120px_1fr_40px] items-center gap-3 text-[12.5px]">
                <span className="text-muted-foreground">{step.label}</span>
                <span className="bg-muted h-2.5 overflow-hidden rounded-full">
                  <i className="bg-brand block h-full rounded-full" style={{ width: `${(step.count / funnelTop) * 100}%` }} />
                </span>
                <b className="text-right font-semibold">{step.count}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-6">
        <div className={cn(card, "overflow-hidden")}>
          <div className="flex flex-wrap items-start justify-between gap-3 p-4 md:p-5">
            <div>
              <AppText type="h4" className="text-[15px] font-semibold">
                Referral network
              </AppText>
              <AppText type="caption" className="text-muted-foreground block">
                Each line is one referral, pointing down to the driver who joined. Click a driver to see their branch.
              </AppText>
            </div>
            <AppTabs
              variant="compact"
              value={scope}
              onValueChange={setScope}
              tabs={[
                { value: "6", label: "Top 6 referrers" },
                { value: "50", label: "Top 50" },
              ]}
            />
          </div>
          <div className="px-4 pb-3 md:px-5">
            <NetworkLegend />
          </div>
          {networkData ? (
            <ReferralNetwork roots={networkData.data.roots} onSelect={(node) => setDriverId(node.id)} />
          ) : (
            <Skeleton className={cn("mx-5 mb-5 h-64 rounded-xl", networkLoading && "animate-pulse")} />
          )}
          {networkData?.data.truncated && (
            <p className="text-muted-foreground border-border border-t px-5 py-2 text-xs">Showing the first 400 drivers in these branches.</p>
          )}
        </div>

        <div className={card}>
          <div className="p-4 pb-2 md:p-5 md:pb-2">
            <AppText type="h4" className="text-[15px] font-semibold">
              Top referrers
            </AppText>
            <AppText type="caption" className="text-muted-foreground block">
              By rewarded referrals · all time
            </AppText>
          </div>
          {leaders.length ? (
            <ul>
              {leaders.map((leader, index) => (
                <li key={leader.user_id}>
                  <button
                    type="button"
                    onClick={() => setDriverId(leader.user_id)}
                    className={cn("border-border hover:bg-brand-soft/60 flex w-full items-center gap-3 border-t px-4 py-2.5 text-left md:px-5", driverId === leader.user_id && "bg-brand-soft/60")}
                  >
                    <span className="text-muted-foreground w-5 text-center text-xs font-bold">{index + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">{leader.name}</span>
                      <span className="bg-muted mt-1.5 block h-1.5 overflow-hidden rounded-full">
                        <i className="bg-brand block h-full rounded-full" style={{ width: `${(leader.rewarded / topRewarded) * 100}%` }} />
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block text-[13px] font-semibold">{leader.rewarded}</span>
                      <span className="text-muted-foreground block text-[11px]">of {leader.total}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground px-5 pb-5 text-sm">Nobody has earned a referral reward yet.</p>
          )}
        </div>
      </section>

      {overview && <ReferralsTable heldCount={overview.kpis.held_for_review} onReview={setReviewId} onSelectDriver={setDriverId} />}

      <ReferrerSheet
        userId={driverId}
        onOpenChange={(open) => !open && setDriverId(null)}
        onReview={setReviewId}
        onSelectDriver={setDriverId}
      />
      <ReferralReviewDialog referralId={reviewId} onOpenChange={(open) => !open && setReviewId(null)} />
    </div>
  );
}

export default function AdminReferrals() {
  return (
    <Suspense>
      <ReferralsDashboard />
    </Suspense>
  );
}
