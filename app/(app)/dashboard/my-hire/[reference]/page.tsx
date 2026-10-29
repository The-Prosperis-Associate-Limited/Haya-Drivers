"use client";

import { AppText } from "@/components/shared/app-text";
import { BackLink } from "@/components/shared/back-link";
import { StarRating } from "@/components/shared/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  driverTypeLabel,
  formatDate,
  formatMoney,
  getInitials,
  prettifyEnum,
} from "@/lib/utils";
import { use, useState } from "react";
import { TodayAttendanceBadge } from "@/components/attendance/today-attendance-badge";
import { HireAttendance } from "../_components/hire-attendance";
import { ReviewCard } from "../_components/review-card";
import { useHire } from "../_hooks/use-hires";
import Link from "next/link";

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
    <div className="mx-auto max-w-[1360px]">
      <BackLink href="/dashboard/my-hire" label="My hire" />

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={hire.driver?.profile_pic ?? undefined} alt="" />
            <AvatarFallback>
              {getInitials(hire.driver?.first_name, hire.driver?.last_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="flex flex-wrap items-center gap-2">
              <AppText type="h2" className="text-lg font-semibold">
                {name}
              </AppText>
              {hire.today_attendance && (
                <TodayAttendanceBadge today={hire.today_attendance} />
              )}
            </span>
            <AppText type="caption" className="text-muted-foreground block">
              {driverTypeLabel(hire.driver_type)} · {hire.title}
            </AppText>
            <span className="mt-1 flex items-center gap-2">
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
                    {hire.driver_rating.toFixed(1)} ({hire.driver_review_count}{" "}
                    reviews)
                  </AppText>
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="border-border mt-5 border-t" />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
            <span className="flex items-center justify-between gap-3">
              <AppText type="h4" className="text-[15px] font-semibold">
                {hire.engagement_type === "MONTHLY"
                  ? "Full-time engagement"
                  : `${prettifyEnum(hire.engagement_type)} engagement`}
              </AppText>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                {started ? "Ongoing" : "Starting soon"}
              </span>
            </span>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: "Started", value: formatDate(hire.starts_at) },
                { label: "Days served", value: String(daysServed) },
                { label: "Months active", value: `${monthsActive} mo` },
              ].map((entry) => (
                <span key={entry.label}>
                  <AppText
                    type="caption"
                    className="text-muted-foreground block text-xs tracking-wide uppercase"
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

            {/* A year is the visual yardstick, not a contract end. */}
            <Progress
              value={Math.min((daysServed / 365) * 100, 100)}
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

          {hire.status === "IN_PROGRESS" && (
            <HireAttendance reference={hire.reference} driverName={name} />
          )}

          <ReviewCard hire={hire} />
        </div>

        <div className="space-y-6">
          <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
            <AppText type="h4" className="text-[15px] font-semibold">
              Haya Drivers profile
            </AppText>
            <div className="mt-4 space-y-3">
              {profileRows.map((row) => (
                <span
                  key={row.label}
                  className="flex items-center justify-between gap-3"
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

            <Button
              variant="outline"
              className="mt-5 h-11 w-full rounded-xl text-sm"
              asChild
            >
              <Link href={`/dashboard/drivers/${hire.driver?.id}`}>
                View Full profile
              </Link>
            </Button>
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
