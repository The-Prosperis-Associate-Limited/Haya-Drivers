"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, UsersRound } from "lucide-react";
import { AppInput } from "@/components/shared/app-input";
import { HIRING_TIMELINE_OPTIONS, cn } from "@/lib/utils";
import type { HiringTimeline } from "@/types/auth";
import { OnboardingShell } from "../_components/onboarding-shell";
import { useOnboardingInsights } from "../_hooks/use-insights";
import { usePreferences } from "../_hooks/use-preferences";
import { useSavePreferences } from "../_hooks/use-save-preferences";

export default function Location() {
  const { preferences } = usePreferences();

  const [location, setLocation] = useState("");
  const [timeline, setTimeline] = useState<HiringTimeline | null>(null);

  useEffect(() => {
    if (!preferences) return;
    setLocation(preferences.primary_location ?? "");
    setTimeline(preferences.hiring_timeline);
  }, [preferences]);

  const { insights, isFetching } = useOnboardingInsights({
    location,
    categories: preferences?.hiring_categories,
    shouldFetch: location.trim().length >= 3,
  });

  const { save, isPending } = useSavePreferences({ redirectTo: "/onboarding/budget" });

  return (
    <OnboardingShell
      step={4}
      title="Where do you need them?"
      subtitle="We'll show drivers who live nearby first, ready on your timeline."
      isPending={isPending}
      continueDisabled={location.trim().length < 2 || !timeline}
      onContinue={() => save({ primary_location: location.trim(), hiring_timeline: timeline })}
    >
      <div className="border-border rounded-[18px] border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-[22px]">
        <AppInput label="Area and state" placeholder="E.g Lekki, Lagos" icon={MapPin} value={location} onChange={(event) => setLocation(event.target.value)} />

        <p className="mt-6 mb-2.5 text-[13px] font-semibold text-slate-700">When should they start?</p>
        <div className="flex flex-wrap gap-2">
          {HIRING_TIMELINE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={timeline === option.value}
              onClick={() => setTimeline(option.value)}
              className={cn(
                "border-border rounded-xl border-[1.5px] bg-white px-3.5 py-2 text-[13px] font-medium text-slate-700",
                timeline === option.value ? "border-brand bg-brand-soft text-brand font-semibold" : "hover:border-slate-300",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {location.trim().length >= 3 && (
          <p className="bg-brand-soft mt-5 flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-[12.5px] text-blue-900" data-testid="nearby-count">
            {isFetching && !insights ? <Loader2 className="text-brand size-4 animate-spin" /> : <UsersRound className="text-brand size-4" />}
            {insights ? (
              insights.scope === "local" ? (
                insights.nearby_count ? (
                  <span>
                    <b>
                      {insights.nearby_count} verified driver{insights.nearby_count === 1 ? "" : "s"}
                    </b>{" "}
                    live in or around {insights.location}.
                  </span>
                ) : (
                  <span>No verified drivers list {insights.location} yet - we&apos;ll widen the search for you.</span>
                )
              ) : (
                <span>Add an area or state so we can count drivers near you.</span>
              )
            ) : (
              <span>Counting drivers near you…</span>
            )}
          </p>
        )}
      </div>
    </OnboardingShell>
  );
}
