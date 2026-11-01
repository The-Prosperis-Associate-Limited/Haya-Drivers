"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, driverTypeLabel, formatMoney, getInitials } from "@/lib/utils";
import { BadgeCheck, Plus, Star } from "lucide-react";
import type { DriverSearchResult } from "@/types/driver";
import { TrustRing } from "./trust-ring";

const MAX_CHIPS = 3;

interface ShellProps {
  driver: DriverSearchResult;
  actions: React.ReactNode;
  className?: string;
}

export const DriverCardShell = function ({
  driver,
  actions,
  className,
}: ShellProps) {
  const name =
    [driver.user.first_name, driver.user.last_name].filter(Boolean).join(" ") ||
    "Driver";
  const location = [driver.user.city, driver.user.state_of_residence]
    .filter(Boolean)
    .join(", ");

  // What the driver can drive and speak - the closest real data to the design's skill chips.
  const chips = [
    ...driver.licence_classes.map((entry) => `Class ${entry}`),
    ...driver.languages,
  ];
  const hiddenCount = chips.length - MAX_CHIPS;

  return (
    <div
      className={cn(
        "border-border flex h-full flex-col rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative shrink-0">
            <Avatar className="size-12">
              <AvatarImage src={driver.user.profile_pic ?? undefined} alt="" />
              <AvatarFallback>
                {getInitials(driver.user.first_name, driver.user.last_name)}
              </AvatarFallback>
            </Avatar>
            <BadgeCheck className="fill-brand absolute -right-0.5 -bottom-0.5 size-4 text-white" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold">{name}</p>
            <p className="text-muted-foreground truncate text-[13px]">
              {[driverTypeLabel(driver.driver_type), location]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
              {driver.years_of_experience != null && (
                <span>{driver.years_of_experience} yrs experience</span>
              )}
              {driver.review_count > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-ink font-medium">
                    {driver.rating.toFixed(1)}
                  </span>
                  ({driver.review_count})
                </span>
              )}
            </p>
          </div>
        </div>

        <TrustRing
          score={driver.trust_score}
          size={52}
          strokeWidth={5}
          label={null}
          caption="trust"
          valueClassName="text-sm"
        />
      </div>

      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {chips.slice(0, MAX_CHIPS).map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
            >
              {chip}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className="text-muted-foreground rounded-full px-1.5 py-1 text-xs font-medium">
              +{hiddenCount} more
            </span>
          )}
        </div>
      )}

      <div className="mt-auto pt-4">
        <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="min-w-0 text-[15px] font-semibold">
            {driver.expected_monthly_rate ? (
              <>
                {formatMoney(
                  driver.expected_monthly_rate,
                  driver.rate_currency,
                )}
                <span className="text-muted-foreground text-xs font-normal">
                  {" "}
                  / month
                </span>
              </>
            ) : (
              <span className="text-muted-foreground text-[13px] font-normal">
                Rate not set
              </span>
            )}
          </p>
          <div className="flex gap-2">{actions}</div>
        </div>
      </div>
    </div>
  );
};

interface Props {
  driver: DriverSearchResult;
  onRequest: (driver: DriverSearchResult) => void;
  className?: string;
}

export const DriverCard = function ({ driver, onRequest, className }: Props) {
  return (
    <DriverCardShell
      driver={driver}
      className={className}
      actions={
        <>
          <Button variant="outline" className="h-10 rounded-xl px-4">
            View ledger
          </Button>
          <Button
            className="h-10 rounded-xl px-4"
            onClick={() => onRequest(driver)}
          >
            <Plus className="h-4 w-4" />
            Request
          </Button>
        </>
      }
    />
  );
};
