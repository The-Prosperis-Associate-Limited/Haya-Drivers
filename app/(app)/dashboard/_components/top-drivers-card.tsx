"use client";

import { AppText } from "@/components/shared/app-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDriverSearch } from "@/hooks/use-driver-search";
import { formatMoney, getInitials } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface Props {
  state?: string | null;
}

// The search already orders by trust score, so the first page is the top of the list.
export const TopDriversCard = function ({ state }: Props) {
  const { drivers, isFetching } = useDriverSearch({
    state: state ?? undefined,
    limit: 3,
  });

  return (
    <div className="border-border rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-2 px-4 pt-4 md:px-5 md:pt-5">
        <div className="min-w-0">
          <AppText type="h4" className="text-[15px] font-semibold">
            Top drivers{state ? " near you" : ""}
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            Verified and highest trust{state ? ` in ${state}` : ""}
          </AppText>
        </div>
        <Link
          href="/dashboard/requests/find-talent"
          className="text-brand inline-flex shrink-0 items-center gap-0.5 text-[13px] font-semibold"
        >
          Browse
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-2">
        {isFetching && !drivers.length ? (
          <div className="space-y-2.5 p-4 md:p-5">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        ) : !drivers.length ? (
          <AppText
            type="caption"
            className="text-muted-foreground block px-4 pt-1 pb-5 md:px-5"
          >
            No verified drivers {state ? `in ${state} ` : ""}yet - browse every
            state from Find drivers.
          </AppText>
        ) : (
          drivers.map((driver) => {
            const name =
              [driver.user.first_name, driver.user.last_name]
                .filter(Boolean)
                .join(" ") || "Driver";
            const facts = [
              `${driver.trust_score} trust`,
              driver.years_of_experience
                ? `${driver.years_of_experience} yrs`
                : null,
              driver.expected_monthly_rate
                ? `${formatMoney(driver.expected_monthly_rate, driver.rate_currency)}/mo`
                : null,
            ].filter(Boolean);

            return (
              <div
                key={driver.id}
                className="flex items-center gap-3 border-t border-slate-100 px-4 py-3 first:border-t-0 md:px-5"
              >
                <Avatar className="size-10">
                  <AvatarImage
                    src={driver.user.profile_pic ?? undefined}
                    alt=""
                  />
                  <AvatarFallback className="text-xs">
                    {getInitials(driver.user.first_name, driver.user.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <AppText
                    type="label"
                    className="block truncate text-[13px] font-semibold"
                  >
                    {name}
                  </AppText>
                  <AppText
                    type="caption"
                    className="text-muted-foreground block truncate"
                  >
                    {facts.join(" · ")}
                  </AppText>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="h-8 shrink-0 rounded-lg px-3 text-xs"
                >
                  <Link href={`/dashboard/drivers/${driver.userId}`}>View</Link>
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
