"use client";

import { BadgePercent, CalendarRange, HandCoins } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatMoney } from "@/lib/utils";
import type { HirePricingGuide } from "@/types/hire";
import type { APIResponse } from "@/types/response";
import { SectionChip } from "../section-chip";

interface Plan {
  icon: LucideIcon;
  title: string;
  figure: string | null;
  basis: string;
  example: string | null;
}

const plansFor = (guide: HirePricingGuide | undefined): Plan[] => [
  {
    icon: BadgePercent,
    title: "Full-time hire",
    figure: guide ? `${guide.fee_percent}%` : null,
    basis: "of the driver's annual salary, once per driver",
    example: guide
      ? `A driver on ${formatMoney(guide.full_time.example.monthly_minor)}/month earns ${formatMoney(guide.full_time.example.annual_minor)} a year, so our fee is ${formatMoney(guide.full_time.example.fee_minor)} - charged once, never renewed.`
      : null,
  },
  {
    icon: CalendarRange,
    title: "Contract hire",
    figure: guide ? `${guide.fee_percent}%` : null,
    basis: "of the whole contract's pay, once per driver",
    example: guide
      ? `A ${guide.contract.example.days}-day contract paying ${formatMoney(guide.contract.example.pay_minor)} has a fee of ${formatMoney(guide.contract.example.fee_minor)}.`
      : null,
  },
  {
    icon: HandCoins,
    title: "Your driver's salary",
    figure: "Paid direct",
    basis: "from you to your driver - never through us",
    example:
      "You see each driver's monthly rate before you request them. We take no cut of it, and it never appears on our invoice.",
  },
];

export const PricingSection = function () {
  const { data, error } = useGetData<APIResponse<HirePricingGuide>>({
    url: API_ENDPOINTS.pricing,
    skipAuth: true,
    silentErrors: true,
  });

  const guide = data?.data;
  const loading = !guide && !error;

  return (
    <section id="pricing" className="bg-white px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionChip>Pricing</SectionChip>

          <h2 className="text-ink mt-5 max-w-xl text-3xl font-bold md:text-4xl">
            One simple fee, shown before you pay
          </h2>

          <p className="text-muted-foreground mt-4 max-w-2xl text-sm leading-relaxed md:text-base">
            Signing up and browsing drivers is free. When you hire, we invoice
            only our service fee
            {guide
              ? ` plus ${guide.vat_percent}% VAT on that fee`
              : " plus VAT on that fee"}
            , itemised before you pay.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {plansFor(guide).map((plan, index) => (
            <Reveal key={plan.title} delay={index * 0.12} className="h-full">
              <div className="border-border flex h-full flex-col rounded-2xl border bg-slate-50 p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2f6bf6]/10 text-[#2f6bf6]">
                  <plan.icon className="h-5 w-5" />
                </span>

                <h3 className="text-ink mt-6 text-lg font-bold">
                  {plan.title}
                </h3>

                {loading && !plan.figure ? (
                  <Skeleton className="mt-3 h-10 w-24 rounded-lg" />
                ) : (
                  plan.figure && (
                    <p className="text-ink mt-3 text-4xl font-bold">
                      {plan.figure}
                    </p>
                  )
                )}

                <p className="text-ink mt-1 text-sm font-medium">
                  {plan.basis}
                </p>

                {loading && !plan.example ? (
                  <Skeleton className="mt-4 h-12 rounded-lg" />
                ) : (
                  plan.example && (
                    <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                      {plan.example}
                    </p>
                  )
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
