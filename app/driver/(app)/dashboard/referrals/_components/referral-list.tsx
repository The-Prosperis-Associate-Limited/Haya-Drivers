"use client";

import { AppTabs } from "@/components/shared/app-tabs";
import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import type { DriverReferral, ReferralOverview } from "@/types/referral";
import type { PaginatedResponse } from "@/types/response";
import { Check, Clock, Search, Undo2, UsersRound, X } from "lucide-react";
import { useState } from "react";

type Filter = "all" | "onboarding" | "qualified";

const AVATAR_TONES = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-orange-100 text-orange-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
];

const RewardChip = function ({ referral }: { referral: DriverReferral }) {
  const amount = formatMoney(referral.reward_minor, referral.currency);
  const chips = {
    REWARDED: { icon: Check, label: `${amount} credited`, tone: "bg-emerald-50 text-emerald-700" },
    HELD: { icon: Search, label: "Under review", tone: "bg-blue-50 text-brand" },
    SIGNED_UP: { icon: Clock, label: "Pending", tone: "bg-amber-50 text-amber-700" },
    REJECTED: { icon: X, label: "Didn't qualify", tone: "bg-muted text-muted-foreground" },
    REVERSED: { icon: Undo2, label: "Reversed", tone: "bg-red-50 text-red-600" },
  } as const;
  const chip = chips[referral.status];
  const Icon = chip.icon;

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold whitespace-nowrap", chip.tone)}>
      <Icon className="size-3.5" />
      {chip.label}
    </span>
  );
};

const Progress = function ({ referral }: { referral: DriverReferral }) {
  const done = referral.progress.step >= 4;

  return (
    <div className="min-w-[150px]">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((step) => (
          <i
            key={step}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              done ? "bg-emerald-500" : step <= referral.progress.step ? "bg-brand" : "bg-muted",
            )}
          />
        ))}
      </div>
      <span className="text-muted-foreground mt-1 block text-[11.5px]">{referral.progress.label}</span>
    </div>
  );
};

export const ReferralList = function ({ overview }: { overview: ReferralOverview }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);

  const { data, isFetching } = useGetData<PaginatedResponse<DriverReferral>>({
    url: API_ENDPOINTS.driverReferrals.list({
      page,
      limit: 10,
      status: filter === "all" ? undefined : filter,
    }),
  });

  const rows = data?.data ?? [];

  return (
    <section className="border-border rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 pb-0 md:p-5 md:pb-0">
        <div>
          <AppText type="h4" className="text-[15px] font-semibold">
            Your referrals
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            Only first names are shown until a driver is verified
          </AppText>
        </div>
        <AppTabs
          variant="compact"
          value={filter}
          onValueChange={(value) => {
            setFilter(value);
            setPage(1);
          }}
          tabs={[
            { value: "all", label: `All ${overview.stats.invited}` },
            { value: "onboarding", label: `Onboarding ${overview.stats.onboarding}` },
            { value: "qualified", label: `Qualified ${overview.stats.qualified}` },
          ]}
        />
      </div>

      <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} isLoading={isFetching}>
        <div className="mt-3">
          {isFetching && !rows.length ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : !rows.length ? (
            <EmptyState
              icon={UsersRound}
              title="No referrals yet."
              description="Share your code with drivers you trust - they'll show up here as soon as they sign up."
            />
          ) : (
            <ul className="divide-border divide-y">
              {rows.map((referral, index) => (
                <li key={referral.id} className="grid gap-3 px-4 py-3.5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_130px_auto] md:items-center md:px-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={cn("grid size-10 shrink-0 place-items-center rounded-full text-[13px] font-semibold", AVATAR_TONES[index % AVATAR_TONES.length])}>
                      {referral.referee.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-semibold">{referral.referee.name}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {[referral.referee.location, referral.referee.verified && "Verified"].filter(Boolean).join(" · ") || "Location not set"}
                      </p>
                    </div>
                  </div>
                  <Progress referral={referral} />
                  <span className="text-muted-foreground text-[13px] whitespace-nowrap">Joined {formatDate(referral.joined_at)}</span>
                  <div className="md:text-right">
                    <RewardChip referral={referral} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Pagination>
    </section>
  );
};
