"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CircleCheck,
  CircleSlash,
  Hourglass,
  Link2Off,
  Timer,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { AppText } from "@/components/shared/app-text";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ShortlistFacts } from "@/components/shortlist/shortlist-facts";
import { TegatLogo } from "@/components/svg/logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn, driverTypeLabel, formatDate, formatTimeLeft } from "@/lib/utils";
import type { ShortlistReply, ShortlistReplyState } from "@/types/hire";
import type { APIResponse } from "@/types/response";

interface Props {
  token: string;
  answer: "yes" | "no" | null;
}

type Outcome = Exclude<ShortlistReplyState, "PENDING">;

const OUTCOMES: Record<
  Outcome,
  { icon: LucideIcon; title: string; body: string }
> = {
  CONFIRMED: {
    icon: CircleCheck,
    title: "You're marked as available",
    body: "Thanks - the team has your answer. If the client picks you, you'll get the full engagement details by email and on your dashboard.",
  },
  DECLINED: {
    icon: CircleSlash,
    title: "You're marked as not available",
    body: "No problem - the team will pick another driver. This doesn't affect your profile or trust score.",
  },
  EXPIRED: {
    icon: Hourglass,
    title: "This invitation has expired",
    body: "The reply window closed before an answer came in, so the team has moved on. Quick replies keep you at the top of the list.",
  },
  CLOSED: {
    icon: Hourglass,
    title: "This engagement is no longer open",
    body: "The team has already settled who is on this hire. Keep your profile up to date for the next one.",
  },
};

const DashboardLink = function () {
  return (
    <Button asChild variant="outline" className="h-10 rounded-xl">
      <Link href="/driver/dashboard">Open your dashboard</Link>
    </Button>
  );
};

const lengthLabel = (job: ShortlistReply["job"]) => {
  if (job.engagement_type === "CONTRACT" && job.duration_days) {
    return ` · ${job.duration_days}-day contract`;
  }

  if (job.duration_months) {
    return ` · ${job.duration_months} month${job.duration_months > 1 ? "s" : ""}`;
  }

  return "";
};

export const ShortlistReplyView = function ({ token, answer }: Props) {
  const [declining, setDeclining] = useState(false);
  const [now] = useState(() => Date.now());

  const { data, error } = useGetData<APIResponse<ShortlistReply>>({
    url: API_ENDPOINTS.shortlists.reply(token),
    skipAuth: true,
    silentErrors: true,
    retry: false,
  });

  const { mutate: reply, isPending } = useSubmitData<{ available: boolean }>({
    url: API_ENDPOINTS.shortlists.reply(token),
    skipAuth: true,
    onSuccessMessage: "Answer sent",
    onSuccess: () => setDeclining(false),
  });

  const invitation = data?.data;
  const outcome =
    invitation && invitation.state !== "PENDING"
      ? OUTCOMES[invitation.state]
      : null;

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#f8fafc] px-4 py-10 md:py-16">
      <Link
        href="/drivers"
        className="text-ink flex items-center gap-2.5 font-semibold"
      >
        <TegatLogo size={32} />
        Haya Drivers
      </Link>

      <main className="border-border mt-8 w-full max-w-md rounded-2xl border bg-white p-5 md:p-6">
        {!invitation && !error && (
          <div className="space-y-3">
            <Skeleton className="h-6 w-2/3 rounded-lg" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
          </div>
        )}

        {!invitation && error && (
          <EmptyState
            icon={Link2Off}
            title="This link isn't valid any more"
            description="Open your dashboard to see the invitations waiting for you."
            action={<DashboardLink />}
            className="py-8"
          />
        )}

        {outcome && (
          <EmptyState
            icon={outcome.icon}
            title={outcome.title}
            description={outcome.body}
            action={<DashboardLink />}
            className="py-8"
          />
        )}

        {invitation?.state === "PENDING" && (
          <div className="space-y-5">
            <div>
              <AppText type="h4" className="text-ink text-lg font-semibold">
                {invitation.first_name
                  ? `Hi ${invitation.first_name}, are`
                  : "Are"}{" "}
                you available for this job?
              </AppText>
              <AppText
                type="caption"
                className="text-muted-foreground mt-1 block text-sm"
              >
                A client is hiring and you&apos;re one of the candidates. Your
                answer goes straight to the team.
              </AppText>
            </div>

            <div className="border-border space-y-3 rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <AppText type="label" className="text-sm font-semibold">
                  {driverTypeLabel(invitation.job.driver_type ?? undefined)}
                  {lengthLabel(invitation.job)}
                </AppText>
                <span className="bg-brand-soft text-brand rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold">
                  Starts {formatDate(invitation.job.starts_at)}
                </span>
              </div>

              <ShortlistFacts request={invitation.job} />

              {invitation.respond_by && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[11.5px] font-semibold",
                    new Date(invitation.respond_by).getTime() - now <
                      2 * 3_600_000
                      ? "text-red-500"
                      : "text-amber-600",
                  )}
                >
                  <Timer className="size-3.5" />
                  Reply within {formatTimeLeft(invitation.respond_by, now)}
                </span>
              )}
            </div>

            <div
              className={cn(
                "flex gap-2",
                answer === "no" ? "flex-col-reverse" : "flex-col",
              )}
            >
              <Button
                variant={answer === "no" ? "outline" : "default"}
                className="h-10 rounded-xl"
                isLoading={isPending && !declining}
                onClick={() => reply({ available: true })}
              >
                {answer === "yes" ? "Confirm I'm available" : "I'm available"}
              </Button>
              <Button
                variant={answer === "no" ? "destructive" : "outline"}
                className={cn(
                  "h-10 rounded-xl",
                  answer !== "no" && "text-destructive border-destructive/30",
                )}
                onClick={() => setDeclining(true)}
              >
                {answer === "no"
                  ? "Confirm I'm not available"
                  : "Not available"}
              </Button>
            </div>
          </div>
        )}
      </main>

      <ConfirmDialog
        isOpen={declining}
        onOpenChange={setDeclining}
        icon={XCircle}
        iconClassName="text-destructive"
        title="Mark yourself as not available?"
        description="The team will pick another driver for this engagement. This won't affect your profile or trust score."
        confirmLabel="Not available"
        confirmVariant="destructive"
        isLoading={isPending}
        onConfirm={() => reply({ available: false })}
      />
    </div>
  );
};
