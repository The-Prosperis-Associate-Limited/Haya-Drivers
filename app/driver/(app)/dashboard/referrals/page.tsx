"use client";

import { AppText } from "@/components/shared/app-text";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatMoney } from "@/lib/utils";
import type { ReferralOverview } from "@/types/referral";
import type { APIResponse } from "@/types/response";
import { Check, Clock, UsersRound, Wallet } from "lucide-react";
import Link from "next/link";
import { ReferralHero } from "./_components/referral-hero";
import { ReferralList } from "./_components/referral-list";

export default function Referrals() {
  const { data } = useGetData<APIResponse<ReferralOverview>>({
    url: API_ENDPOINTS.driverReferrals.overview,
  });

  const overview = data?.data;

  if (!overview) {
    return (
      <div className="mx-auto max-w-[1360px] space-y-5">
        <Skeleton className="h-72 rounded-[20px]" />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const reward = formatMoney(overview.reward_minor, overview.currency);
  const holdDays = Math.max(1, Math.round(overview.hold_hours / 24));

  const steps = [
    {
      title: "Share your code",
      body: (
        <>
          Send your link, or have them type <b>{overview.code}</b> when they
          create their account.
        </>
      ),
    },
    {
      title: "They finish onboarding",
      body: "Every onboarding step, then they submit their documents for verification.",
    },
    {
      title: `You get ${reward}`,
      body: `Credited to your wallet when they submit, and withdrawable after ${holdDays} day${holdDays > 1 ? "s" : ""}.`,
    },
  ];

  return (
    <div className="mx-auto max-w-[1360px] space-y-5 lg:space-y-6">
      <PageHeader
        title="Refer & earn"
        subtitle={`Invite drivers you trust and get ${reward} for each one who submits their documents.`}
        className="mb-0"
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-6">
        <ReferralHero overview={overview} />

        <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
          <AppText type="h4" className="text-[15px] font-semibold">
            How it works
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            Three steps, no limit on referrals
          </AppText>
          <ol className="mt-4 space-y-3.5">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="bg-brand-soft text-brand grid size-8 shrink-0 place-items-center rounded-[10px] text-[13px] font-bold">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-[13.5px] font-semibold">{step.title}</span>
                  <span className="text-muted-foreground block text-[12.5px]">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="text-muted-foreground mt-4 text-[11.5px]">
            Rewards are checked for abuse. Accounts created to collect rewards
            are refused and can be suspended.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <StatCard
          icon={UsersRound}
          label="Drivers invited"
          value={overview.stats.invited}
          caption={`${overview.stats.invited_this_month} this month`}
          captionTone="muted"
        />
        <StatCard
          icon={Clock}
          tone="amber"
          label="Still onboarding"
          value={overview.stats.onboarding}
          caption={`${formatMoney(overview.stats.waiting_minor, overview.currency)} waiting on them`}
          captionTone="muted"
        />
        <StatCard
          icon={Check}
          tone="green"
          label="Qualified"
          value={overview.stats.qualified}
          caption={
            overview.stats.under_review
              ? `${overview.stats.under_review} under review`
              : "Submitted for verification"
          }
          captionTone="muted"
        />
        <StatCard
          icon={Wallet}
          tone="violet"
          label="Earned from referrals"
          value={formatMoney(overview.stats.earned_minor, overview.currency)}
          caption={
            <Link href="/driver/dashboard/wallet" className="text-brand font-semibold">
              View wallet
            </Link>
          }
        />
      </section>

      <ReferralList overview={overview} />
    </div>
  );
}
