import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import {
  cn,
  driverTypeLabel,
  formatDate,
  formatDateTime,
  formatMoney,
  WORK_SCHEDULE_LABELS,
} from "@/lib/utils";
import { Check, ChevronRight, ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import type { OverviewHireRequest } from "@/types/booking";

interface Props {
  request?: OverviewHireRequest;
  moreCount: number;
}

const CARD =
  "border-border rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]";

// Stage flags come straight off the request's status and shortlist counts.
const stagesFor = function (request: OverviewHireRequest) {
  const { status, shortlist, drivers_needed, invoice } = request;
  const invoiced = status === "INVOICED" || status === "PAYMENT_REVIEW";
  const seats = `${drivers_needed} seat${drivers_needed > 1 ? "s" : ""}`;

  return [
    {
      title: "Request received",
      detail: formatDateTime(request.createdAt),
      done: true,
    },
    {
      title: "Shortlisting drivers",
      detail: shortlist.total
        ? `${shortlist.total} vetted candidate${shortlist.total > 1 ? "s" : ""} shortlisted`
        : "Our team is finding vetted drivers for you",
      done: shortlist.total > 0 || invoiced,
    },
    {
      title: invoiced ? "Drivers assigned" : "Drivers confirming availability",
      detail: invoiced
        ? `${drivers_needed} driver${drivers_needed > 1 ? "s" : ""} assigned by our team`
        : `${shortlist.confirmed} of ${seats} confirmed${shortlist.pending ? ` · ${shortlist.pending} still deciding` : ""}`,
      done: shortlist.confirmed >= drivers_needed || invoiced,
    },
    {
      title: "Invoice sent",
      detail: invoice
        ? `${formatMoney(invoice.total_minor, invoice.currency)} to pay`
        : "Sent once your drivers are confirmed",
      done: invoiced,
    },
    {
      title: "Payment confirmed",
      detail:
        status === "PAYMENT_REVIEW"
          ? "We're checking your transfer"
          : invoice?.proof_rejected_reason
            ? `Proof rejected: ${invoice.proof_rejected_reason}`
            : "Driver contact details unlock here",
      done: false,
    },
    {
      title: "Drivers start",
      detail: `Planned for ${formatDate(request.starts_at)}`,
      done: false,
    },
  ];
};

export const RequestTracker = function ({ request, moreCount }: Props) {
  if (!request) {
    return (
      <div
        className={cn(
          CARD,
          "flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center md:p-5",
        )}
      >
        <span className="bg-brand-soft text-brand grid size-11 shrink-0 place-items-center rounded-xl">
          <ClipboardList className="size-5" />
        </span>
        <div className="flex-1">
          <AppText type="h4" className="text-[15px] font-semibold">
            No open hire requests
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            Tell us who you need and we'll shortlist vetted drivers - you can
            follow every step here.
          </AppText>
        </div>
        <Button asChild className="h-10 rounded-xl px-4">
          <Link href="/dashboard/my-hire/request">
            <Plus className="size-4" />
            Request a driver
          </Link>
        </Button>
      </div>
    );
  }

  const stages = stagesFor(request);
  const current = stages.findIndex((stage) => !stage.done);
  const facts = [
    request.driver_type ? driverTypeLabel(request.driver_type) : null,
    WORK_SCHEDULE_LABELS[request.schedule],
    request.resumption_time && request.closing_time
      ? `${request.resumption_time} - ${request.closing_time}`
      : null,
    [request.nearest_area, request.state].filter(Boolean).join(", ") || null,
  ].filter(Boolean);

  return (
    <div className={CARD}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 md:px-5 md:pt-5">
        <div className="min-w-0">
          <AppText type="h4" className="text-[15px] font-semibold">
            {request.reference} · {request.drivers_needed} driver
            {request.drivers_needed > 1 ? "s" : ""}
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            {facts.join(" · ")}
          </AppText>
        </div>
        <Link
          href={`/dashboard/my-hire/requests/${request.reference}`}
          className="text-brand inline-flex shrink-0 items-center gap-0.5 text-[13px] font-semibold"
        >
          View request
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      <ol className="p-4 md:p-5">
        {stages.map((stage, index) => {
          const isCurrent = index === current;
          return (
            <li
              key={stage.title}
              className="relative flex gap-3 pb-4 last:pb-0"
            >
              {index < stages.length - 1 && (
                <span
                  className={cn(
                    "absolute top-7 bottom-0.5 left-[12px] w-0.5 rounded",
                    stage.done ? "bg-brand" : "bg-slate-200",
                  )}
                />
              )}
              <span
                className={cn(
                  "relative grid size-[26px] shrink-0 place-items-center rounded-full border-2 text-[11px] font-bold",
                  stage.done
                    ? "border-brand bg-brand text-white"
                    : isCurrent
                      ? "border-brand text-brand bg-white shadow-[0_0_0_4px_var(--color-brand-soft)]"
                      : "border-slate-200 bg-white text-slate-400",
                )}
              >
                {stage.done ? <Check className="size-3.5" /> : index + 1}
              </span>
              <div className="min-w-0">
                <AppText
                  type="label"
                  className={cn(
                    "block text-[13px]",
                    stage.done || isCurrent
                      ? "text-ink font-semibold"
                      : "text-muted-foreground font-medium",
                  )}
                >
                  {stage.title}
                </AppText>
                <AppText type="caption" className="text-muted-foreground block">
                  {stage.detail}
                </AppText>
              </div>
            </li>
          );
        })}
      </ol>

      {moreCount > 0 && (
        <Link
          href="/dashboard/my-hire"
          className="text-brand block border-t border-slate-100 px-4 py-3 text-center text-[13px] font-semibold md:px-5"
        >
          +{moreCount} more open request{moreCount > 1 ? "s" : ""}
        </Link>
      )}
    </div>
  );
};
