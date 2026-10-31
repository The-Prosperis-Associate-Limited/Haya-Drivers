"use client";

import { formatMoney, formatMoneyCompact } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { useState } from "react";
import { OnboardingShell } from "../_components/onboarding-shell";
import { useOnboardingInsights } from "../_hooks/use-insights";
import { usePreferences } from "../_hooks/use-preferences";
import { useCompleteOnboarding, useSavePreferences } from "../_hooks/use-save-preferences";

const MIN_MAJOR = 30_000;
const MAX_MAJOR = 1_000_000;
const STEP_MAJOR = 5_000;

export default function Budget() {
  const { preferences } = usePreferences();
  const [chosen, setChosen] = useState<number | null>(null);
  const [median, setMedian] = useState<number | null>(null);

  // Until the client moves the slider: their saved budget, else the local median, else a sensible default.
  const budget = chosen ?? (preferences?.monthly_budget ? Math.round(preferences.monthly_budget / 100) : null) ?? median ?? 200_000;

  const { insights, isFetching } = useOnboardingInsights({
    location: preferences?.primary_location,
    budget: budget * 100,
    categories: preferences?.hiring_categories,
    shouldFetch: !!preferences,
  });

  const marketMedian = insights?.market ? Math.min(MAX_MAJOR, Math.max(MIN_MAJOR, Math.round(insights.market.median_minor / 100 / STEP_MAJOR) * STEP_MAJOR)) : null;
  if (marketMedian !== null && median === null) setMedian(marketMedian);

  const { complete, isPending: isCompleting } = useCompleteOnboarding({ redirectTo: "/onboarding/done" });
  const { save, isPending: isSaving } = useSavePreferences({ onSuccess: () => complete(undefined) });

  const market = insights?.market;
  const position = (minor: number) => `${Math.min(100, Math.max(0, ((minor / 100 - MIN_MAJOR) / (MAX_MAJOR - MIN_MAJOR)) * 100))}%`;
  const place = insights?.location ?? "your area";

  return (
    <OnboardingShell
      step={5}
      title="What's your monthly budget per driver?"
      subtitle="Drivers set their own rates. Your budget decides who you see first - it's never shown to them."
      isPending={isSaving || isCompleting}
      continueLabel="Finish"
      onContinue={() => save({ monthly_budget: budget * 100 })}
    >
      <div className="border-border rounded-[18px] border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-[22px]">
        <p>
          <span className="text-[34px] font-semibold tracking-tight" data-testid="budget-value">
            {formatMoney(budget * 100, "NGN")}
          </span>
          <span className="text-muted-foreground"> / month</span>
        </p>

        <input
          type="range"
          aria-label="Monthly budget per driver"
          min={MIN_MAJOR}
          max={MAX_MAJOR}
          step={STEP_MAJOR}
          value={budget}
          onChange={(event) => setChosen(Number(event.target.value))}
          className="accent-brand mt-4 w-full"
        />

        <div className="relative mt-4 h-2.5 rounded-full bg-slate-100">
          {market && (
            <span
              className="absolute inset-y-0 rounded-full bg-emerald-200"
              style={{ left: position(market.low_minor), right: `calc(100% - ${position(market.high_minor)})` }}
              title="Typical range"
            />
          )}
          <i className="bg-foreground absolute -top-[5px] h-5 w-1 rounded-sm" style={{ left: position(budget * 100) }} />
        </div>
        <div className="text-muted-foreground mt-1.5 flex justify-between text-[11px]">
          <span>{formatMoneyCompact(MIN_MAJOR * 100, "NGN")}</span>
          <span className="px-2 text-center" data-testid="market-range">
            {market
              ? `Typical ${market.scope === "local" ? `in ${place}` : "across the platform"}: ${formatMoneyCompact(market.low_minor, "NGN")} - ${formatMoneyCompact(market.high_minor, "NGN")}`
              : "Not enough rates yet to show a typical range"}
          </span>
          <span>{formatMoneyCompact(MAX_MAJOR * 100, "NGN")}+</span>
        </div>

        {insights && insights.within_budget_pct !== null && insights.budget_minor !== null && (
          <p className={`bg-brand-soft mt-4 flex gap-2.5 rounded-xl px-3.5 py-3 text-[12.5px] text-blue-900 transition-opacity ${isFetching ? "opacity-60" : ""}`} data-testid="within-budget">
            <TrendingUp className="text-brand mt-px size-4 shrink-0" />
            <span>
              At {formatMoney(insights.budget_minor, "NGN")} you&apos;ll see{" "}
              <b>
                {insights.within_budget_count} of {insights.nearby_count}
              </b>{" "}
              verified drivers {insights.scope === "local" ? `in ${place}` : "on the platform"} ({insights.within_budget_pct}%). Drivers who haven&apos;t set a rate always show.
            </span>
          </p>
        )}
      </div>
    </OnboardingShell>
  );
}
