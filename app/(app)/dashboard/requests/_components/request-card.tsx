"use client";

import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import {
  cn,
  formatMoney,
  formatRelativeTime,
  HIRE_ENGAGEMENT_LABELS,
} from "@/lib/utils";
import Link from "next/link";
import { Banknote } from "lucide-react";
import type { StaffingRequestListItem } from "@/types/request";

interface Props {
  request: StaffingRequestListItem;
  onCloseRequest: (request: StaffingRequestListItem) => void;
}

export const RequestCard = function ({ request, onCloseRequest }: Props) {
  const open = request.status === "OPEN";

  const meta = [
    [request.city, request.state].filter(Boolean).join(", "),
    HIRE_ENGAGEMENT_LABELS[request.engagement_type],
    `Posted ${formatRelativeTime(request.createdAt)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  // Applicant/shortlist counts are hidden until the driver-apply design is resolved.
  return (
    <div className="border-border flex flex-col rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <AppText type="h3" className="truncate text-[15px] font-semibold">
            {request.title}
          </AppText>
          <AppText
            type="caption"
            className="text-muted-foreground mt-1 block text-xs"
          >
            {meta}
          </AppText>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide uppercase",
            open
              ? "bg-emerald-50 text-emerald-600"
              : "bg-muted text-muted-foreground",
          )}
        >
          {open ? "Open" : "Closed"}
        </span>
      </div>

      {request.description && (
        <AppText
          type="caption"
          className="text-ink mt-3 line-clamp-2 block text-sm"
        >
          {request.description}
        </AppText>
      )}

      <div className="bg-brand-soft/60 mt-4 flex items-center justify-between gap-3 rounded-xl px-4 py-3">
        <span className="flex items-center gap-2">
          <Banknote className="text-brand h-4 w-4 shrink-0" />
          <AppText type="caption" className="text-brand text-xs font-medium">
            Monthly budget
          </AppText>
        </span>
        <AppText type="label" className="truncate text-sm font-bold">
          {formatMoney(request.budget, request.currency)}
        </AppText>
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end">
        <Button asChild className="h-10 rounded-lg px-5 text-sm">
          <Link href={`/dashboard/requests/${request.reference}`}>
            View matches
          </Link>
        </Button>
        {open && (
          <Button
            variant="outline"
            className="h-10 rounded-lg px-5 text-sm"
            onClick={() => onCloseRequest(request)}
          >
            Close Request
          </Button>
        )}
      </div>
    </div>
  );
};
