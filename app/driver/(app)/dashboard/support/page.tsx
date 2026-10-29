"use client";

import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTickets } from "@/hooks/use-tickets";
import { cn, formatDate } from "@/lib/utils";
import { LifeBuoy } from "lucide-react";
import Link from "next/link";
import type { TicketStatus } from "@/types/ticket";

const statusTones: Record<TicketStatus, string> = {
  OPEN: "bg-amber-50 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-gray-50 text-gray-600 border-gray-200",
};

export default function Support() {
  const { tickets, isFetching } = useTickets();

  return (
    <div className="mx-auto max-w-[1360px] space-y-6">
      <PageHeader
        title="Support"
        subtitle="Everything you've raised with our team. Start something new from the support button at the bottom of your screen."
      />

      <div className="border-border overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        {isFetching && !tickets.length ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : !tickets.length ? (
          <EmptyState
            icon={LifeBuoy}
            title="No tickets yet."
            description="Anything you raise with support will show up here."
          />
        ) : (
          <div className="divide-border divide-y">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/driver/dashboard/support/${ticket.reference}`}
                className="flex flex-col gap-2 p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between md:p-5"
              >
                <div className="min-w-0">
                  <AppText type="label" className="block truncate">
                    {ticket.subject}
                  </AppText>
                  <AppText
                    type="caption"
                    className="text-muted-foreground block truncate"
                  >
                    {ticket.reference} · {formatDate(ticket.createdAt)}
                  </AppText>
                </div>

                <StatusBadge
                  label={ticket.status.toLowerCase().replace("_", " ")}
                  className={cn("shrink-0", statusTones[ticket.status])}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
