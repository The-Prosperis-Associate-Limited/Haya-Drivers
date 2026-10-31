"use client";

import { AppText } from "@/components/shared/app-text";
import { TrustRing } from "@/components/drivers/trust-ring";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTrustScore } from "../_hooks/use-dashboard";

const COMPONENTS = [
  { key: "verification", label: "Identity & licence" },
  { key: "reviews", label: "Client rating" },
  { key: "completions", label: "Reliability" },
] as const;

export const TrustScoreCard = function () {
  const { trustScore, isFetching } = useTrustScore();

  return (
    <div className="border-border flex flex-col rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <AppText type="h4" className="text-[15px] font-semibold">
            Trust score
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            What clients see on your profile
          </AppText>
        </div>
        <Link
          href="/driver/dashboard/trust-score"
          className="text-brand inline-flex items-center gap-0.5 text-[13px] font-semibold"
        >
          Details
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {isFetching && !trustScore ? (
        <Skeleton className="mt-4 h-48 rounded-xl" />
      ) : (
        trustScore && (
          <>
            <div className="mt-4 flex items-center gap-4">
              <TrustRing
                score={trustScore.total}
                size={112}
                strokeWidth={10}
                label={null}
                caption="out of 100"
                valueClassName="text-3xl tracking-tight"
              />
              {trustScore.percentile !== null && (
                <AppText
                  type="caption"
                  className="text-muted-foreground text-[12.5px]"
                >
                  More trusted than{" "}
                  <span className="text-ink font-semibold">
                    {trustScore.percentile}%
                  </span>{" "}
                  of active drivers near you.
                </AppText>
              )}
            </div>

            <div className="mt-5 space-y-3">
              {COMPONENTS.map(({ key, label }) => (
                <div key={key}>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-ink font-medium">{label}</span>
                    <span className="text-muted-foreground">
                      {trustScore[key]} / {trustScore.max[key]}
                    </span>
                  </div>
                  <Progress
                    value={
                      trustScore.max[key]
                        ? (trustScore[key] / trustScore.max[key]) * 100
                        : 0
                    }
                    aria-label={`${label} points`}
                    className="mt-1.5 h-2"
                  />
                </div>
              ))}
            </div>
          </>
        )
      )}
    </div>
  );
};
