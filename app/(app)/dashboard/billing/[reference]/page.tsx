"use client";

import {
  DocumentLines,
  PrintDocument,
} from "@/components/shared/print-document";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { useGetProfile } from "@/hooks/use-get-profile";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  driverTypeLabel,
  formatDate,
  formatMoney,
  invoiceLines,
  WORK_SCHEDULE_LABELS,
} from "@/lib/utils";
import { Receipt } from "lucide-react";
import { use } from "react";
import type { APIResponse } from "@/types/response";
import type { HireRequest } from "@/types/hire";

export default function InvoiceDocument({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = use(params);
  const { profile } = useGetProfile();

  const { data, isFetching } = useGetData<APIResponse<HireRequest>>({
    url: API_ENDPOINTS.hireRequests.detail(reference),
  });

  const request = data?.data;
  const invoice = request?.invoice;

  if (!request || !invoice) {
    return isFetching ? (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-[480px] rounded-2xl" />
      </div>
    ) : (
      <EmptyState
        icon={Receipt}
        title="No invoice yet"
        description="This request hasn't been invoiced."
      />
    );
  }

  const paid = invoice.status === "PAID";
  const currency = invoice.currency;
  const billedTo =
    profile?.client_profile?.organisation_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
  const account = request.payment_account;

  const engagement = [
    `${request.drivers_needed} × ${request.driver_type ? driverTypeLabel(request.driver_type) : "driver"}`,
    WORK_SCHEDULE_LABELS[request.schedule],
    `from ${formatDate(request.starts_at)}`,
  ].join(" · ");

  return (
    <PrintDocument
      title={paid ? "Receipt" : "Invoice"}
      reference={invoice.reference}
      status={
        paid
          ? { label: "Paid", tone: "paid" }
          : invoice.status === "PAYMENT_REVIEW"
            ? { label: "Payment under review", tone: "info" }
            : invoice.status === "VOID"
              ? { label: "Void", tone: "info" }
              : { label: "Payment due", tone: "due" }
      }
      backHref="/dashboard/billing"
      backLabel="Billing"
      meta={[
        { label: "Issued", value: formatDate(invoice.createdAt) },
        paid && invoice.paid_at
          ? { label: "Paid", value: formatDate(invoice.paid_at) }
          : { label: "Due", value: "On receipt" },
        { label: "Hire request", value: request.reference },
      ]}
      parties={[
        { label: "From", lines: ["Haya Drivers", "hayadrivers.com"] },
        {
          label: paid ? "Received from" : "Billed to",
          lines: [
            billedTo || "Client",
            profile?.email,
            [profile?.address, profile?.city, profile?.state_of_residence]
              .filter(Boolean)
              .join(", ") || null,
          ],
        },
      ]}
      footnote={
        paid
          ? `Payment received and confirmed by Haya Drivers${invoice.paid_at ? ` on ${formatDate(invoice.paid_at)}` : ""}. Thank you.`
          : account
            ? `Pay by bank transfer: ${account.bank_name} · ${account.account_number} · ${account.account_name}. Use ${request.reference} as the narration, then upload your proof of payment on the hire request.`
            : "Pay by bank transfer into the Haya Drivers organisation account shown on your hire request."
      }
    >
      <DocumentLines
        headers={["Item", "Amount"]}
        rows={invoiceLines(invoice).map((line) => ({
          key: line.label,
          cells: [
            <span key="l">
              <span className="text-ink block font-medium">{line.label}</span>
              {line.label !== `VAT (${invoice.vat_percent}%)` && (
                <span className="text-muted-foreground block text-xs">
                  {engagement}
                </span>
              )}
            </span>,
            formatMoney(line.amount_minor, currency),
          ],
        }))}
        totals={[
          {
            label: paid ? "Total paid" : "Total due",
            value: formatMoney(invoice.total_minor, currency),
            strong: true,
          },
        ]}
      />
    </PrintDocument>
  );
}
