"use client";

import { AppTabs } from "@/components/shared/app-tabs";
import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  cn,
  driverTypeLabel,
  formatDate,
  formatMoney,
  INVOICE_STATUS_STYLES,
} from "@/lib/utils";
import { CircleCheckBig, Clock, FileText, Receipt } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { PaginatedResponse } from "@/types/response";
import type {
  ClientInvoiceRow,
  HireInvoiceStatus,
  InvoiceSummary,
} from "@/types/hire";

const LIMIT = 10;

const FILTERS: { value: "ALL" | HireInvoiceStatus; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "PAYMENT_REVIEW", label: "Under review" },
  { value: "PAID", label: "Paid" },
];

export default function Billing() {
  const [filter, setFilter] =
    useState<(typeof FILTERS)[number]["value"]>("ALL");
  const [page, setPage] = useState(1);

  const { data, isFetching } = useGetData<
    PaginatedResponse<ClientInvoiceRow> & { summary: InvoiceSummary }
  >({
    url: API_ENDPOINTS.invoices.list({
      page,
      limit: LIMIT,
      status: filter === "ALL" ? undefined : filter,
    }),
  });

  const invoices = data?.data ?? [];
  const summary = data?.summary;
  const currency = invoices[0]?.currency ?? "NGN";

  return (
    <div className="mx-auto max-w-[1360px] space-y-5 lg:space-y-6">
      <PageHeader
        title="Billing & invoices"
        subtitle="Every invoice Haya Drivers has issued you, with a PDF of each invoice and receipt."
      />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
        {!summary ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard
              icon={Clock}
              tone="amber"
              label="Outstanding"
              value={formatMoney(summary.outstanding_minor, currency)}
              caption={
                summary.outstanding_count
                  ? `${summary.outstanding_count} invoice${summary.outstanding_count > 1 ? "s" : ""} to settle`
                  : "Nothing to pay"
              }
              captionTone="muted"
            />
            <StatCard
              icon={Receipt}
              label="Under review"
              value={summary.in_review_count}
              caption="Proofs we're checking"
              captionTone="muted"
            />
            <StatCard
              icon={CircleCheckBig}
              tone="green"
              label="Paid to date"
              value={formatMoney(summary.paid_minor, currency)}
              caption={`${summary.paid_count} paid invoice${summary.paid_count === 1 ? "" : "s"}`}
              captionTone="muted"
            />
          </>
        )}
      </section>

      <Pagination
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        limit={LIMIT}
        isLoading={isFetching}
      >
        <div className="border-border overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-3 md:px-5 md:pt-5">
            <AppText type="h4" className="text-[15px] font-semibold">
              Invoices
            </AppText>
            <AppTabs
              variant="chip"
              value={filter}
              onValueChange={(value) => {
                setFilter(value);
                setPage(1);
              }}
              tabs={FILTERS.map(({ value, label }) => ({ value, label }))}
            />
          </div>

          {isFetching && !invoices.length ? (
            <div className="space-y-3 p-4 md:p-5">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          ) : !invoices.length ? (
            <EmptyState
              icon={Receipt}
              title="No invoices here"
              description="Invoices are issued once our team has confirmed the drivers for a hire request."
            />
          ) : (
            <table className="w-full border-collapse text-left">
              <thead className="hidden md:table-header-group">
                <tr className="bg-slate-50 text-[11.5px] font-semibold tracking-wide text-slate-500 uppercase">
                  <th className="px-5 py-2.5 font-semibold">Invoice</th>
                  <th className="px-3 py-2.5 font-semibold">For</th>
                  <th className="px-3 py-2.5 font-semibold">Issued</th>
                  <th className="px-3 py-2.5 font-semibold">Total</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 pr-5 pl-2" />
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const request = invoice.hire_request;
                  const status = INVOICE_STATUS_STYLES[invoice.status];
                  const payable = invoice.status === "UNPAID";

                  return (
                    <tr
                      key={invoice.id}
                      className="grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-slate-100 px-4 py-4 md:table-row md:px-0 md:py-0"
                    >
                      <td className="col-span-2 md:px-5 md:py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="bg-brand-soft text-brand grid size-9 shrink-0 place-items-center rounded-[11px]">
                            <FileText className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <AppText
                              type="label"
                              className="block truncate text-[13.5px] font-semibold"
                            >
                              {invoice.reference}
                            </AppText>
                            <AppText
                              type="caption"
                              className="text-muted-foreground block truncate"
                            >
                              {request.reference}
                            </AppText>
                          </div>
                        </div>
                      </td>
                      <td className="text-[13px] md:px-3 md:py-3.5">
                        <span className="text-muted-foreground block text-[11px] md:hidden">
                          For
                        </span>
                        {request.drivers_needed} driver
                        {request.drivers_needed > 1 ? "s" : ""}
                        <span className="text-muted-foreground block text-xs">
                          {request.driver_type
                            ? driverTypeLabel(request.driver_type)
                            : "Any driver type"}
                        </span>
                      </td>
                      <td className="text-[13px] md:px-3 md:py-3.5 md:whitespace-nowrap">
                        <span className="text-muted-foreground block text-[11px] md:hidden">
                          Issued
                        </span>
                        {formatDate(invoice.createdAt)}
                        {invoice.paid_at && (
                          <span className="text-muted-foreground block text-xs">
                            Paid {formatDate(invoice.paid_at)}
                          </span>
                        )}
                      </td>
                      <td className="text-[13px] font-semibold md:px-3 md:py-3.5 md:whitespace-nowrap">
                        <span className="text-muted-foreground block text-[11px] font-normal md:hidden">
                          Total
                        </span>
                        {formatMoney(invoice.total_minor, invoice.currency)}
                      </td>
                      <td className="md:px-3 md:py-3.5">
                        <StatusBadge
                          label={
                            invoice.proof_rejected_reason && payable
                              ? "Proof rejected"
                              : status.label
                          }
                          className={cn(
                            "whitespace-nowrap",
                            invoice.proof_rejected_reason && payable
                              ? "border-red-200 bg-red-50 text-red-600"
                              : status.tone,
                          )}
                        />
                      </td>
                      <td className="col-span-2 flex gap-2 md:table-cell md:py-3.5 md:pr-5 md:pl-2 md:text-right md:whitespace-nowrap">
                        {payable && (
                          <Button
                            asChild
                            className="h-9 flex-1 rounded-xl px-3 text-xs md:mr-2"
                          >
                            <Link
                              href={`/dashboard/my-hire/requests/${request.reference}`}
                            >
                              Pay now
                            </Link>
                          </Button>
                        )}
                        <Button
                          asChild
                          variant="outline"
                          className="h-9 flex-1 rounded-xl px-3 text-xs"
                        >
                          <Link
                            href={`/dashboard/billing/${request.reference}`}
                          >
                            {invoice.status === "PAID" ? "Receipt" : "Invoice"}{" "}
                            PDF
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Pagination>
    </div>
  );
}
