"use client";

import { AppText } from "@/components/shared/app-text";
import { BackLink } from "@/components/shared/back-link";
import { StarRating } from "@/components/shared/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  cn,
  driverTypeLabel,
  formatDate,
  formatMoney,
  getInitials,
  prettifyEnum,
} from "@/lib/utils";
import { use, useState } from "react";
import { TodayAttendanceBadge } from "@/components/attendance/today-attendance-badge";
import { HireAttendance } from "../_components/hire-attendance";
import { HireSalary } from "../_components/hire-salary";
import { ReviewCard } from "../_components/review-card";
import { useHire } from "../_hooks/use-hires";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";

const DAY_MS = 24 * 60 * 60 * 1000;

export default function HireDetail({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = use(params);
  const [now] = useState(() => Date.now());

  const { hire, isFetching } = useHire(reference);

  if (!hire) {
    return (
      <div className="mx-auto max-w-[1360px] space-y-4">
        {isFetching && (
          <>
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </>
        )}
      </div>
    );
  }

  const name =
    [hire.driver?.first_name, hire.driver?.last_name]
      .filter(Boolean)
      .join(" ") || "Driver";

  const profile = hire.driver_details?.driver_profile;

  const daysServed = Math.max(
    Math.floor((now - new Date(hire.starts_at).getTime()) / DAY_MS),
    0,
  );
  const weeksActive = Math.floor(daysServed / 7);
  const monthsActive = Math.floor(daysServed / 30);

  const started = new Date(hire.starts_at).getTime() <= now;
  const ended = hire.status === "COMPLETED" || hire.status === "CANCELLED";
  const termDays = hire.ends_at
    ? Math.max(
        (new Date(hire.ends_at).getTime() -
          new Date(hire.starts_at).getTime()) /
          DAY_MS,
        1,
      )
    : 365;

  // No stored Haya Drivers ID exists - this is a stable display form of the driver's
  // record id, not a second identifier.
  const tegatId = hire.driver
    ? `TG-DRV-${hire.driver.id.slice(-4).toUpperCase()}`
    : "-";

  const location = [
    hire.driver_details?.city,
    hire.driver_details?.state_of_residence,
  ]
    .filter(Boolean)
    .join(", ");

  const profileRows = [
    { label: "Haya Drivers ID", value: tegatId },
    {
      label: "Gender",
      value: hire.driver_details?.gender
        ? prettifyEnum(hire.driver_details.gender)
        : "-",
    },
    { label: "Based in", value: location || "-" },
    {
      label: "Work pref.",
      value:
        hire.engagement_type === "MONTHLY"
          ? "Permanent"
          : prettifyEnum(hire.engagement_type),
    },
    {
      label: "Rate",
      value: profile?.expected_monthly_rate
        ? `${formatMoney(profile.expected_monthly_rate, profile.rate_currency)} / mo`
        : "-",
    },
    { label: "Reviews", value: String(hire.driver_review_count) },
  ];

  return (
    <div className="mx-auto max-w-[1360px] space-y-5">
      <BackLink href="/dashboard/my-hire" label="My hire" />

      <div className="border-border overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="from-brand-soft/80 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r to-white p-4 md:p-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative shrink-0">
              <Avatar className="size-16">
                <AvatarImage
                  src={hire.driver?.profile_pic ?? undefined}
                  alt=""
                />
                <AvatarFallback className="text-base">
                  {getInitials(hire.driver?.first_name, hire.driver?.last_name)}
                </AvatarFallback>
              </Avatar>
              <BadgeCheck className="fill-brand absolute -right-0.5 -bottom-0.5 size-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <h1 className="text-[22px] font-semibold tracking-tight">
                  {name}
                </h1>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    ended
                      ? "bg-slate-100 text-slate-600"
                      : "bg-emerald-50 text-emerald-600",
                  )}
                >
                  {ended ? "Ended" : started ? "Ongoing" : "Starting soon"}
                </span>
                {hire.today_attendance && (
                  <TodayAttendanceBadge today={hire.today_attendance} />
                )}
              </span>
              <AppText type="caption" className="text-muted-foreground block">
                {driverTypeLabel(hire.driver_type)} · {hire.title}
              </AppText>
              <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                {location && (
                  <AppText type="caption" className="text-muted-foreground">
                    {location}
                  </AppText>
                )}
                {profile?.years_of_experience != null && (
                  <AppText type="caption" className="text-muted-foreground">
                    {profile.years_of_experience} years experience
                  </AppText>
                )}
                {hire.driver_review_count > 0 && (
                  <span className="flex items-center gap-1">
                    <StarRating
                      rating={hire.driver_rating}
                      starClassName="h-3.5 w-3.5"
                    />
                    <AppText type="caption" className="text-muted-foreground">
                      {hire.driver_rating.toFixed(1)} (
                      {hire.driver_review_count} reviews)
                    </AppText>
                  </span>
                )}
              </span>
            </div>
          </div>
          <Button asChild className="h-10 w-full rounded-xl px-5 sm:w-auto">
            <Link href={`/dashboard/drivers/${hire.driver?.id}`}>
              View full profile
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-6">
        <div className="min-w-0 space-y-5 xl:space-y-6">
          <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
            <AppText type="h4" className="text-[15px] font-semibold">
              {hire.engagement_type === "MONTHLY"
                ? "Full-time engagement"
                : `${prettifyEnum(hire.engagement_type)} engagement`}
            </AppText>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: "Started", value: formatDate(hire.starts_at) },
                { label: "Days served", value: String(daysServed) },
                { label: "Months active", value: `${monthsActive} mo` },
              ].map((entry) => (
                <span key={entry.label}>
                  <AppText
                    type="caption"
                    className="text-muted-foreground block text-xs"
                  >
                    {entry.label}
                  </AppText>
                  <AppText
                    type="label"
                    className="mt-1 block text-lg font-semibold"
                  >
                    {entry.value}
                  </AppText>
                </span>
              ))}
            </div>

            {/* Without an end date a year is the visual yardstick. */}
            <Progress
              value={Math.min((daysServed / termDays) * 100, 100)}
              className="mt-8 h-1.5"
            />
            <AppText
              type="caption"
              className="text-muted-foreground mt-2 block"
            >
              Active for {weeksActive} week{weeksActive === 1 ? "" : "s"} ·{" "}
              {hire.ends_at
                ? `until ${formatDate(hire.ends_at)}`
                : "no end date"}
            </AppText>
          </div>

          <HireSalary reference={hire.reference} driverName={name} />

          {hire.status === "IN_PROGRESS" && (
            <HireAttendance reference={hire.reference} driverName={name} />
          )}

          <ReviewCard hire={hire} />
        </div>

        <div className="min-w-0 space-y-5 xl:space-y-6">
          <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
            <AppText type="h4" className="text-[15px] font-semibold">
              Haya Drivers profile
            </AppText>
            <div className="divide-border mt-3 divide-y">
              {profileRows.map((row) => (
                <span
                  key={row.label}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <AppText type="caption" className="text-muted-foreground">
                    {row.label}
                  </AppText>
                  <AppText type="label" className="text-sm">
                    {row.value}
                  </AppText>
                </span>
              ))}
            </div>
          </div>

          <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
            <AppText type="h4" className="text-[15px] font-semibold">
              Engagement type
            </AppText>
            <AppText
              type="caption"
              className="text-muted-foreground mt-3 block"
            >
              {hire.ends_at
                ? `Fixed term - ends ${formatDate(hire.ends_at)}`
                : "Open-ended - no fixed end date"}
            </AppText>
          </div>
        </div>
      </div>
    </div>
  );
}
