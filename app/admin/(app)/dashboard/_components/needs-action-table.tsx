"use client";

import { AppTabs } from "@/components/shared/app-tabs";
import { AppText } from "@/components/shared/app-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, driverTypeLabel } from "@/lib/utils";
import { BadgeCheck, Clock3 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { HireStage, NeedsActionHire } from "@/types/admin";

interface Props {
  hires?: NeedsActionHire[];
  total?: number;
}

type Filter = "all" | "shortlisting" | "payments";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "shortlisting", label: "Shortlisting" },
  { value: "payments", label: "Payments" },
];

const CHIP = {
  brand: "bg-brand-soft text-brand",
  amber: "bg-amber-50 text-amber-700",
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-red-50 text-red-600",
  slate: "bg-slate-100 text-slate-600",
};

const stageChip = function (hire: NeedsActionHire) {
  const STAGES: Record<HireStage, { label: string; tone: keyof typeof CHIP }> =
    {
      NEW: { label: "Shortlist drivers", tone: "brand" },
      SHORTLISTING: {
        label: hire.shortlist.pending ? "Awaiting replies" : "Needs candidates",
        tone: "amber",
      },
      TRIM: { label: `Trim to ${hire.drivers_needed}`, tone: "amber" },
      READY: { label: "Ready to invoice", tone: "green" },
      PAYMENT: { label: "Proof uploaded", tone: "brand" },
    };

  return STAGES[hire.stage];
};

const waited = function (since: string, now: number) {
  const minutes = Math.max(
    0,
    Math.floor((now - new Date(since).getTime()) / 60000),
  );
  const hours = Math.floor(minutes / 60);

  if (hours >= 48)
    return { label: `${Math.floor(hours / 24)} days`, tone: "red" as const };
  if (hours >= 1)
    return {
      label: `${hours}h`,
      tone: hours >= 24 ? ("amber" as const) : ("slate" as const),
    };
  return { label: `${minutes}m`, tone: "slate" as const };
};

const Chip = function ({
  tone,
  children,
}: {
  tone: keyof typeof CHIP;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold whitespace-nowrap",
        CHIP[tone],
      )}
    >
      {children}
    </span>
  );
};

export const NeedsActionTable = function ({ hires, total }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [now] = useState(() => Date.now());

  const rows = (hires ?? []).filter((hire) =>
    filter === "all"
      ? true
      : filter === "payments"
        ? hire.stage === "PAYMENT"
        : hire.stage !== "PAYMENT",
  );

  return (
    <div className="border-border overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 pb-3 md:px-5 md:pt-5">
        <div>
          <AppText type="h4" className="text-[15px] font-semibold">
            Hires needing action
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            {total && total > (hires?.length ?? 0)
              ? `Oldest ${hires?.length} of ${total}`
              : "Oldest first"}
          </AppText>
        </div>
        <AppTabs
          tabs={FILTERS}
          value={filter}
          onValueChange={setFilter}
          variant="compact"
        />
      </div>

      {!hires ? (
        <div className="space-y-2 px-4 pb-5 md:px-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : !rows.length ? (
        <AppText
          type="caption"
          className="text-muted-foreground block px-4 pt-2 pb-8 text-center md:px-5"
        >
          {hires.length
            ? "Nothing in this view."
            : "All caught up - no hire request is waiting on the team."}
        </AppText>
      ) : (
        <table className="w-full border-collapse text-left">
          <thead className="hidden md:table-header-group">
            <tr className="bg-slate-50 text-[11.5px] font-semibold tracking-wide text-slate-500 uppercase">
              <th className="px-5 py-2.5 font-semibold">Request</th>
              <th className="px-3 py-2.5 font-semibold">Seats</th>
              <th className="px-3 py-2.5 font-semibold">Candidates</th>
              <th className="px-3 py-2.5 font-semibold">Waiting</th>
              <th className="py-2.5 pr-5 pl-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((hire) => {
              const stage = stageChip(hire);
              const wait = waited(hire.waiting_since, now);
              const details = [
                hire.reference,
                hire.driver_type ? driverTypeLabel(hire.driver_type) : null,
                hire.area,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <tr
                  key={hire.reference}
                  className="grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-slate-100 px-4 py-4 md:table-row md:px-0 md:py-0"
                >
                  <td className="col-span-2 md:px-5 md:py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 shrink-0">
                        <AvatarImage
                          src={hire.client.profile_pic ?? undefined}
                          alt=""
                        />
                        <AvatarFallback className="bg-brand-soft text-brand text-xs">
                          {hire.client.name
                            .split(" ")
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 md:max-w-[240px]">
                        <AppText
                          type="label"
                          className="block truncate text-[13.5px] font-semibold"
                        >
                          {hire.client.name}
                        </AppText>
                        <AppText
                          type="caption"
                          className="text-muted-foreground block truncate"
                        >
                          {details}
                        </AppText>
                      </div>
                    </div>
                  </td>
                  <td className="text-[13px] md:px-3 md:py-3">
                    <span className="text-muted-foreground block text-[11px] md:hidden">
                      Seats
                    </span>
                    <span className="font-semibold">{hire.drivers_needed}</span>
                  </td>
                  <td className="md:px-3 md:py-3">
                    <span className="text-muted-foreground mb-1 block text-[11px] md:hidden">
                      Candidates
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {!hire.shortlist.total && (
                        <span className="text-muted-foreground text-xs">
                          None yet
                        </span>
                      )}
                      {!!hire.shortlist.confirmed && (
                        <Chip tone="green">
                          <BadgeCheck className="size-3" />
                          {hire.shortlist.confirmed}
                        </Chip>
                      )}
                      {!!hire.shortlist.pending && (
                        <Chip tone="amber">
                          <Clock3 className="size-3" />
                          {hire.shortlist.pending}
                        </Chip>
                      )}
                      {!!hire.shortlist.declined && (
                        <Chip tone="red">
                          {hire.shortlist.declined} declined
                        </Chip>
                      )}
                    </div>
                  </td>
                  <td className="md:px-3 md:py-3">
                    <span className="text-muted-foreground mb-1 block text-[11px] md:hidden">
                      Waiting
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <Chip tone={stage.tone}>{stage.label}</Chip>
                      <Chip tone={wait.tone}>{wait.label}</Chip>
                    </div>
                  </td>
                  <td className="col-span-2 md:py-3 md:pr-5 md:pl-2 md:text-right">
                    <Button
                      asChild
                      variant={hire.stage === "PAYMENT" ? "default" : "outline"}
                      className="h-9 w-full rounded-xl px-4 text-xs md:w-auto"
                    >
                      <Link href={`/admin/dashboard/hires?q=${hire.reference}`}>
                        {hire.stage === "PAYMENT" ? "Confirm" : "Open"}
                      </Link>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};
