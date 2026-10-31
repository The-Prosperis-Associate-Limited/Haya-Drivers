"use client";

import { AppText } from "@/components/shared/app-text";
import { BackLink } from "@/components/shared/back-link";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProfile } from "@/hooks/use-get-profile";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_STYLES,
  ENGAGEMENT_TYPE_LABELS,
  clientNameOf,
  cn,
  driverTypeLabel,
  formatDate,
  formatDateTime,
  formatPay,
  formatWorkingHours,
  getInitials,
  WORK_SCHEDULE_LABELS,
} from "@/lib/utils";
import {
  CalendarDays,
  CircleCheckBig,
  Clock,
  Info,
  MapPin,
  Navigation,
  Phone,
  Play,
  Wallet,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  useCompleteJob,
  useJobRequest,
  useStartJob,
} from "../_hooks/use-job-requests";
import { UnverifiedNotice } from "../_components/unverified-notice";
import { JobAttendance } from "../_components/job-attendance";
import { JobSalary } from "../_components/job-salary";
import { ShiftControl } from "../_components/shift-control";

interface FactProps {
  icon: typeof MapPin;
  label: string;
  value: React.ReactNode;
}

const Fact = function ({ icon: Icon, label, value }: FactProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="bg-brand-soft text-brand grid size-9 shrink-0 place-items-center rounded-[11px]">
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0">
        <AppText type="caption" className="text-muted-foreground block">
          {label}
        </AppText>
        <AppText type="label" className="block font-semibold break-words">
          {value}
        </AppText>
      </div>
    </div>
  );
};

const CARD =
  "border-border rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]";

type Action = "start" | "complete";

export default function JobRequestDetail() {
  const params = useParams<{ reference: string }>();
  const reference = params.reference;
  const [confirming, setConfirming] = useState<Action | null>(null);

  const { profile } = useGetProfile();
  const verification = profile?.driver_profile?.verification_status;
  const isVerified = verification === "APPROVED";

  const { booking, isFetching } = useJobRequest(reference, isVerified);

  const { startJob, isPending: isStarting } = useStartJob(reference);
  const { completeJob, isPending: isCompleting } = useCompleteJob(reference);

  if (profile && !isVerified) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <BackLink href="/driver/dashboard/job-request" label="My jobs" />
        <UnverifiedNotice status={verification ?? "UNSUBMITTED"} />
      </div>
    );
  }

  if (isFetching && !booking) {
    return (
      <div className="mx-auto max-w-[1360px] space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (!booking) return null;

  const location = [booking.city, booking.state].filter(Boolean).join(", ");
  const clientName = clientNameOf(booking.client);

  // Contact details only make sense once the job is on - before that the driver
  // has not agreed to anything.
  const canSeeContact = ["ACCEPTED", "IN_PROGRESS", "COMPLETED"].includes(
    booking.status,
  );

  const workingDays = booking.schedule
    ? WORK_SCHEDULE_LABELS[booking.schedule]
    : null;
  const hours =
    booking.resumption_time && booking.closing_time
      ? `${booking.resumption_time} - ${booking.closing_time}`
      : null;

  const action =
    booking.status === "ACCEPTED"
      ? {
          key: "start" as const,
          label: "Start job",
          icon: Play,
          pending: isStarting,
        }
      : booking.status === "IN_PROGRESS"
        ? {
            key: "complete" as const,
            label: "Mark complete",
            icon: CircleCheckBig,
            pending: isCompleting,
          }
        : null;

  const confirm = () => {
    const done = { onSuccess: () => setConfirming(null) };
    if (confirming === "start") startJob({}, done);
    if (confirming === "complete") completeJob({}, done);
  };

  return (
    <div className="mx-auto max-w-[1360px] space-y-5 lg:space-y-6">
      <BackLink href="/driver/dashboard/job-request" label="My jobs" />

      <div className={cn(CARD, "overflow-hidden")}>
        <div className="from-brand-soft/70 bg-gradient-to-r to-white p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3.5">
              <Avatar className="size-14">
                <AvatarImage
                  src={booking.client.profile_pic ?? undefined}
                  alt=""
                />
                <AvatarFallback className="bg-brand-soft text-brand">
                  {getInitials(
                    booking.client.first_name,
                    booking.client.last_name,
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <AppText
                    type="h2"
                    className="text-xl font-semibold tracking-tight"
                  >
                    {clientName}
                  </AppText>
                  <StatusBadge
                    label={BOOKING_STATUS_LABELS[booking.status]}
                    className={BOOKING_STATUS_STYLES[booking.status]}
                  />
                </div>
                <AppText type="caption" className="text-muted-foreground block">
                  {driverTypeLabel(booking.driver_type)} ·{" "}
                  {ENGAGEMENT_TYPE_LABELS[booking.engagement_type]} ·{" "}
                  {booking.reference}
                </AppText>
              </div>
            </div>

            {action && (
              <Button
                isLoading={action.pending}
                onClick={() => setConfirming(action.key)}
                className="h-11 w-full rounded-xl px-6 sm:w-auto"
              >
                <action.icon className="size-4" />
                {action.label}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start xl:gap-6">
        <div className="min-w-0 space-y-5 xl:space-y-6">
          <div className={CARD}>
            <div className="px-4 pt-4 md:px-6 md:pt-5">
              <AppText type="h4" className="text-[15px] font-semibold">
                Engagement details
              </AppText>
            </div>
            <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 md:p-6">
              <Fact
                icon={Wallet}
                label="Your pay"
                value={formatPay(
                  booking.amount,
                  booking.currency,
                  booking.engagement_type,
                )}
              />
              <Fact
                icon={CalendarDays}
                label={booking.ends_at ? "Dates" : "Start date"}
                value={
                  booking.ends_at
                    ? `${formatDate(booking.starts_at)} - ${formatDate(booking.ends_at)}`
                    : formatDate(booking.starts_at)
                }
              />
              <Fact
                icon={Clock}
                label="Working hours"
                value={
                  workingDays
                    ? [workingDays, hours].filter(Boolean).join(" · ")
                    : formatWorkingHours(booking.starts_at, booking.ends_at)
                }
              />
              <Fact
                icon={MapPin}
                label="Location"
                value={location || booking.pickup_address}
              />
              <Fact
                icon={Navigation}
                label="Pickup"
                value={booking.pickup_address}
              />
              {booking.dropoff_address && (
                <Fact
                  icon={MapPin}
                  label="Drop off"
                  value={booking.dropoff_address}
                />
              )}
            </div>
          </div>

          {(booking.description || !!booking.requirements.length) && (
            <div className={cn(CARD, "space-y-5 p-4 md:p-6")}>
              {booking.description && (
                <div>
                  <AppText type="h4" className="text-[15px] font-semibold">
                    Role brief
                  </AppText>
                  <AppText
                    type="body"
                    className="text-foreground/80 mt-1.5 text-sm"
                  >
                    {booking.description}
                  </AppText>
                </div>
              )}

              {!!booking.requirements.length && (
                <div>
                  <AppText type="h4" className="text-[15px] font-semibold">
                    What the client expects
                  </AppText>
                  <ul className="text-foreground/80 mt-2.5 list-disc space-y-1.5 pl-5 text-sm">
                    {booking.requirements.map((requirement, index) => (
                      <li key={index}>{requirement}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {["MONTHLY", "CONTRACT"].includes(booking.engagement_type) && (
            <JobSalary reference={booking.reference} clientName={clientName} />
          )}

          {["IN_PROGRESS", "COMPLETED"].includes(booking.status) && (
            <JobAttendance reference={booking.reference} />
          )}
        </div>

        <div className="min-w-0 space-y-5 xl:space-y-6">
          {booking.status === "IN_PROGRESS" && booking.today_attendance && (
            <div className={cn(CARD, "p-4 md:p-5")}>
              <AppText type="h4" className="mb-3 text-[15px] font-semibold">
                Today
              </AppText>
              <ShiftControl booking={booking} />
            </div>
          )}

          <div className={cn(CARD, "p-4 md:p-5")}>
            <AppText type="h4" className="text-[15px] font-semibold">
              Client contact
            </AppText>
            {canSeeContact && booking.client.phone_no ? (
              <a
                href={`tel:${booking.client.phone_no}`}
                className="bg-brand-soft text-brand mt-3 flex items-center gap-3 rounded-xl p-3 text-sm font-semibold"
              >
                <Phone className="size-4" />
                {booking.client.phone_no}
              </a>
            ) : (
              <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <Info className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <AppText type="caption" className="text-amber-700">
                  {canSeeContact
                    ? "The client hasn't added a phone number yet."
                    : "Contact details are shared once the client's payment is confirmed"}
                </AppText>
              </div>
            )}
          </div>

          {!!booking.status_events?.length && (
            <div className={cn(CARD, "p-4 md:p-5")}>
              <AppText type="h4" className="mb-4 text-[15px] font-semibold">
                Timeline
              </AppText>

              <ol>
                {booking.status_events.map((event, index, events) => (
                  <li
                    key={event.id}
                    className="relative flex gap-3 pb-4 last:pb-0"
                  >
                    {index < events.length - 1 && (
                      <span className="bg-border absolute top-5 bottom-0 left-[9px] w-px" />
                    )}
                    <span className="border-brand relative mt-0.5 size-[19px] shrink-0 rounded-full border-4 bg-white" />
                    <div>
                      <AppText type="label" className="block font-semibold">
                        {BOOKING_STATUS_LABELS[event.to_status]}
                      </AppText>
                      <AppText
                        type="caption"
                        className="text-muted-foreground block"
                      >
                        {formatDateTime(event.createdAt)}
                        {event.note ? ` - ${event.note}` : ""}
                      </AppText>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirming !== null}
        onOpenChange={(open) => !open && setConfirming(null)}
        icon={confirming === "complete" ? CircleCheckBig : Play}
        iconClassName="text-brand"
        title={
          confirming === "complete"
            ? "Mark this job complete?"
            : "Start this job now?"
        }
        description={
          confirming === "complete"
            ? `This ends your engagement with ${clientName} and checks you out if you're on duty. It moves to Completed and can't be reopened.`
            : "Starting also checks you in for today. Your start time is recorded against the scheduled start and counts towards your on-time rate."
        }
        confirmLabel={confirming === "complete" ? "Mark complete" : "Start job"}
        isLoading={isStarting || isCompleting}
        onConfirm={confirm}
      />
    </div>
  );
}
