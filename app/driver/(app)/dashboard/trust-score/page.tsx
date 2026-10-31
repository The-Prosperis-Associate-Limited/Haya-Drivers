"use client";

import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { TrustRing } from "@/components/drivers/trust-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import { CircleCheck, Gauge } from "lucide-react";
import { useTrustScore } from "../_hooks/use-dashboard";
import type { TrustScoreBreakdown } from "@/types/driver";

// The score is one number out of 100 from the server and the weights live
// there. Nothing on this page recomputes it - the bars only divide points by
// their own maximum so a component that is full looks full.
const standingFor = function (total: number) {
  if (total >= 80) return "Excellent standing";
  if (total >= 60) return "Good standing";
  if (total >= 40) return "Building up";
  return "Just getting started";
};

const componentsFor = function (breakdown: TrustScoreBreakdown) {
  const { facts, max } = breakdown;

  return [
    {
      key: "verification",
      label: "Identity & licence",
      earned: breakdown.verification,
      max: max.verification,
      caption:
        facts.verification_status === "APPROVED"
          ? "NIN verified; licence review complete"
          : "Complete verification to earn these points",
    },
    {
      key: "reviews",
      label: "Client rating",
      earned: breakdown.reviews,
      max: max.reviews,
      caption: facts.review_count
        ? `${facts.review_average.toFixed(1)} average from ${facts.review_count} bookings`
        : "No client reviews yet",
    },
    {
      key: "completions",
      label: "Reliability",
      earned: breakdown.completions,
      max: max.completions,
      caption: facts.bookings_engaged
        ? `${facts.bookings_completed} of ${facts.bookings_engaged} bookings completed`
        : "No bookings taken on yet",
    },
  ];
};

export default function TrustScore() {
  const { trustScore, isFetching } = useTrustScore();

  if (isFetching && !trustScore) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!trustScore) return null;

  const components = componentsFor(trustScore);

  return (
    <div className="mx-auto max-w-[1360px] space-y-5 lg:space-y-6">
      <PageHeader
        title="Trust score"
        subtitle="A transparent measure of your verification, client service, reliability and training progress."
      />

      <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] xl:gap-6">
        <div className="relative isolate flex flex-col items-start gap-5 overflow-hidden rounded-[20px] bg-[radial-gradient(120%_140%_at_100%_0%,#5b8cff_0%,transparent_55%),linear-gradient(135deg,#2f6bf6_0%,#1f56d9_60%,#1a46b3_100%)] p-5 text-white sm:flex-row sm:items-center md:p-7">
          <span className="pointer-events-none absolute -top-16 -right-16 -z-10 size-56 rounded-full border border-white/15" />
          <TrustRing
            score={trustScore.total}
            size={148}
            strokeWidth={12}
            label={null}
            caption="out of 100"
            valueClassName="text-5xl tracking-tight"
            light
          />

          <div className="space-y-2">
            <AppText
              type="caption"
              className="block font-semibold tracking-wide text-white/75 uppercase"
            >
              Current score
            </AppText>
            <AppText type="h3" className="text-2xl font-semibold text-white">
              {standingFor(trustScore.total)}
            </AppText>
            {trustScore.percentile !== null && (
              <AppText type="caption" className="block text-white/85">
                Your profile is more trusted than {trustScore.percentile}% of
                active drivers near you.
              </AppText>
            )}
          </div>
        </div>

        <div className="border-border space-y-5 rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-6">
          <div className="space-y-1">
            <AppText type="h4" className="text-[15px] font-semibold">
              Score breakdown
            </AppText>
            <AppText type="caption" className="text-muted-foreground block">
              Updated after each verified activity
            </AppText>
          </div>

          <div className="space-y-5">
            {components.map((component) => {
              const percent = component.max
                ? Math.round((component.earned / component.max) * 100)
                : 0;

              return (
                <div key={component.key} className="space-y-2">
                  <AppText type="h4" className="text-sm font-semibold">
                    {component.label}
                  </AppText>

                  <div className="flex items-center gap-3">
                    <Progress
                      value={percent}
                      aria-label={component.label}
                      className="flex-1"
                    />
                    <AppText
                      type="caption"
                      className="text-foreground w-10 shrink-0 text-right"
                    >
                      {percent}%
                    </AppText>
                  </div>

                  <AppText
                    type="caption"
                    className="text-muted-foreground block"
                  >
                    {component.caption}
                  </AppText>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-border rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-6">
        <AppText type="h4" className="text-[15px] font-semibold">
          Recent score activity
        </AppText>

        {!trustScore.recent_activity.length ? (
          <EmptyState
            icon={Gauge}
            title="Nothing has moved your score yet."
            description="Verification, completed bookings, client reviews and finished training all show up here."
          />
        ) : (
          <div className="mt-4 space-y-4">
            {trustScore.recent_activity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="bg-brand-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                  <CircleCheck className="text-brand h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <AppText type="label" className="block">
                    {activity.title}
                  </AppText>
                  <AppText
                    type="caption"
                    className="text-muted-foreground block"
                  >
                    {activity.description ?? formatDate(activity.createdAt)}
                  </AppText>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
