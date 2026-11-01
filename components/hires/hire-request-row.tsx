"use client";

import { AppText } from "@/components/shared/app-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  cn,
  driverTypeLabel,
  formatDate,
  formatMoney,
  getInitials,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, UserSearch } from "lucide-react";
import Link from "next/link";
import type { HireRequest, HireRequestStatus } from "@/types/hire";

export const HIRE_REQUEST_STATUS_STYLES: Record<HireRequestStatus, string> = {
  PENDING_REVIEW: "bg-amber-50 text-amber-600",
  INVOICED: "bg-blue-50 text-blue-600",
  PAYMENT_REVIEW: "bg-purple-50 text-purple-600",
  PAID: "bg-emerald-50 text-emerald-600",
  DECLINED: "bg-red-50 text-red-600",
  CANCELLED: "bg-muted text-muted-foreground",
};

export const HIRE_REQUEST_STATUS_LABELS: Record<HireRequestStatus, string> = {
  PENDING_REVIEW: "Under review",
  INVOICED: "Awaiting payment",
  PAYMENT_REVIEW: "Confirming payment",
  PAID: "Paid",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
};

interface Props {
  requests: HireRequest[];
}

const driversOf = (request: HireRequest) =>
  request.assignments?.length
    ? request.assignments.map((assignment) => assignment.driver)
    : request.driver
      ? [request.driver]
      : [];

export const HireRequestsTable = function ({ requests }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead className="hidden md:table-header-group">
          <tr className="bg-slate-50 text-[11.5px] font-semibold tracking-wide text-slate-500 uppercase">
            <th className="px-5 py-2.5 font-semibold">Request</th>
            <th className="px-3 py-2.5 font-semibold">Starts</th>
            <th className="px-3 py-2.5 font-semibold">Status</th>
            <th className="px-3 py-2.5 font-semibold">Invoice</th>
            <th className="py-2.5 pr-5 pl-2" />
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => {
            const drivers = driversOf(request);
            const driver = drivers[0] ?? null;
            const baseName = driver
              ? [driver.first_name, driver.last_name]
                  .filter(Boolean)
                  .join(" ") || "Driver"
              : request.drivers_needed > 1
                ? `Matching ${request.drivers_needed} drivers`
                : "Matching a driver";
            const name =
              drivers.length > 1
                ? `${baseName} +${drivers.length - 1} more`
                : baseName;

            return (
              <tr
                key={request.id}
                className="grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-slate-100 px-4 py-4 md:table-row md:px-0 md:py-0"
              >
                <td className="col-span-2 md:px-5 md:py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage
                        src={driver?.profile_pic ?? undefined}
                        alt=""
                      />
                      <AvatarFallback>
                        {driver ? (
                          getInitials(driver.first_name, driver.last_name)
                        ) : (
                          <UserSearch className="size-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 md:max-w-[240px]">
                      <AppText
                        type="label"
                        className="block truncate text-[13.5px] font-semibold"
                      >
                        {name}
                      </AppText>
                      <AppText
                        type="caption"
                        className="text-muted-foreground block truncate"
                      >
                        {driverTypeLabel(
                          driver?.driver_profile?.driver_type ??
                            request.driver_type ??
                            undefined,
                        )}{" "}
                        · {request.reference}
                      </AppText>
                    </div>
                  </div>
                </td>
                <td className="text-[13px] md:px-3 md:py-3 md:whitespace-nowrap">
                  <span className="text-muted-foreground block text-[11px] md:hidden">
                    Starts
                  </span>
                  {formatDate(request.starts_at)}
                </td>
                <td className="md:px-3 md:py-3">
                  <span className="text-muted-foreground mb-1 block text-[11px] md:hidden">
                    Status
                  </span>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                      HIRE_REQUEST_STATUS_STYLES[request.status],
                    )}
                  >
                    {HIRE_REQUEST_STATUS_LABELS[request.status]}
                  </span>
                </td>
                <td className="text-[13px] md:px-3 md:py-3 md:whitespace-nowrap">
                  <span className="text-muted-foreground block text-[11px] md:hidden">
                    Invoice
                  </span>
                  {request.invoice ? (
                    <span className="font-semibold">
                      {formatMoney(
                        request.invoice.total_minor,
                        request.invoice.currency,
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Not yet</span>
                  )}
                </td>
                <td className="col-span-2 md:py-3 md:pr-5 md:pl-2 md:text-right">
                  <Button
                    asChild
                    variant="outline"
                    className="h-9 w-full rounded-xl px-4 text-xs md:size-9 md:p-0"
                  >
                    <Link
                      href={`/dashboard/my-hire/requests/${request.reference}`}
                      aria-label={`Open request ${request.reference}`}
                    >
                      <span className="md:sr-only">Open request</span>
                      <ChevronRight className="hidden size-4 md:block" />
                    </Link>
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
