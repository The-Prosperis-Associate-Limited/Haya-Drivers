"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProfile } from "@/hooks/use-get-profile";
import { driverTypeLabel, formatMoney } from "@/lib/utils";
import { Check, Search, UsersRound } from "lucide-react";
import Link from "next/link";
import { useOnboardingInsights } from "../_hooks/use-insights";
import { usePreferences } from "../_hooks/use-preferences";

export default function OnboardingDone() {
  const { profile } = useGetProfile();
  const { preferences } = usePreferences();
  const { insights } = useOnboardingInsights({
    location: preferences?.primary_location,
    budget: preferences?.monthly_budget,
    categories: preferences?.hiring_categories,
    shouldFetch: !!preferences,
  });

  const matched = insights?.within_budget_count ?? insights?.nearby_count ?? 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:py-14">
      <div className="mx-auto max-w-[720px] space-y-4">
        <div className="grid place-items-center gap-2.5 rounded-[22px] bg-[radial-gradient(120%_140%_at_100%_0%,#5b8cff_0%,transparent_55%),linear-gradient(135deg,#2f6bf6_0%,#1f56d9_60%,#1a46b3_100%)] px-5 py-9 text-center text-white">
          <span className="text-brand grid size-[72px] place-items-center rounded-full bg-white shadow-[0_0_0_10px_rgba(255,255,255,0.14)]">
            <Check className="size-8" strokeWidth={3} />
          </span>
          <h1 className="mt-2 text-[28px] leading-tight font-semibold tracking-tight">You&apos;re all set{profile?.first_name ? `, ${profile.first_name}` : ""}</h1>
          <p className="max-w-[480px] text-sm text-white/85" data-testid="done-summary">
            {!insights
              ? "Finding drivers that match your brief…"
              : matched
                ? `We found ${matched} verified driver${matched === 1 ? "" : "s"}${insights.scope === "local" ? ` in ${insights.location}` : ""}${insights.within_budget_count !== null ? " within your budget" : ""}.`
                : "No verified drivers match every detail yet - our team can build you a shortlist instead."}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2.5">
            <Button asChild className="text-brand h-11 rounded-xl bg-white px-5 hover:bg-white/90">
              <Link href="/dashboard/requests/find-talent">
                <Search className="size-4" />
                See matching drivers
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-xl border-white/35 bg-white/10 px-5 text-white hover:bg-white/20 hover:text-white">
              <Link href="/dashboard/my-hire/request">Request a shortlist</Link>
            </Button>
          </div>
        </div>

        <section className="border-border rounded-[18px] border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-[22px]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-[14.5px] font-semibold">Top matches</h3>
              <p className="text-muted-foreground text-xs">Verified, nearby and within budget</p>
            </div>
            <Link href="/dashboard" className="text-brand text-[13px] font-semibold">
              Go to dashboard
            </Link>
          </div>

          {!insights ? (
            <div className="space-y-2">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          ) : insights.matches.length ? (
            <ul className="divide-border divide-y">
              {insights.matches.map((driver) => (
                <li key={driver.id}>
                  <Link href={`/dashboard/drivers/${driver.id}`} className="hover:bg-muted/50 -mx-2 flex items-center gap-3 rounded-xl px-2 py-3">
                    <span className="bg-brand-soft text-brand grid size-10 shrink-0 place-items-center rounded-full text-[13px] font-semibold">
                      {driver.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold">{driver.name}</span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {[driverTypeLabel(driver.driver_type), driver.years_of_experience != null ? `${driver.years_of_experience} yrs` : null, driver.location].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block rounded-full bg-emerald-50 px-2 py-0.5 text-[11.5px] font-semibold text-emerald-700">Trust {driver.trust_score}</span>
                      {driver.expected_monthly_rate && <span className="text-muted-foreground mt-0.5 block text-[11px]">{formatMoney(driver.expected_monthly_rate, "NGN")}/mo</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground flex items-center gap-2 py-4 text-sm">
              <UsersRound className="size-4" />
              No exact matches yet. Request a shortlist and our team will find drivers for you.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
