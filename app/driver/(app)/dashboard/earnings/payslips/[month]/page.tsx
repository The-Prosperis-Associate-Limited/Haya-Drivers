"use client";

import {
  DocumentLines,
  PrintDocument,
} from "@/components/shared/print-document";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate, formatMoney } from "@/lib/utils";
import { use } from "react";
import type { APIResponse } from "@/types/response";
import type { EarningsStatement } from "@/types/earnings";

const TYPE_LABELS: Record<string, string> = {
  BOOKING_PAYMENT: "Engagement pay",
  PLATFORM_FEE: "Platform fee",
  PAYOUT: "Withdrawal to bank",
  PAYOUT_REVERSAL: "Withdrawal reversed",
  ADJUSTMENT: "Adjustment",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "On hold",
  AVAILABLE: "Available",
  PAID_OUT: "Paid out",
  REVERSED: "Reversed",
};

export default function Payslip({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = use(params);

  const { data, isFetching } = useGetData<APIResponse<EarningsStatement>>({
    url: API_ENDPOINTS.earnings.statement(month),
  });

  const statement = data?.data;

  if (!statement) {
    return isFetching ? (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-[480px] rounded-2xl" />
      </div>
    ) : null;
  }

  const currency = statement.currency;
  const period = new Date(`${statement.month}-01T00:00:00Z`).toLocaleString(
    "en-GB",
    { month: "long", year: "numeric", timeZone: "UTC" },
  );
  const driverName = [statement.driver?.first_name, statement.driver?.last_name]
    .filter(Boolean)
    .join(" ");
  const account = statement.payout_account;

  return (
    <PrintDocument
      title="Payslip"
      reference={statement.reference}
      backHref="/driver/dashboard/earnings"
      backLabel="Earnings"
      meta={[
        { label: "Pay period", value: period },
        { label: "Issued", value: formatDate(statement.generated_at) },
      ]}
      parties={[
        {
          label: "Paid by",
          lines: ["Haya Drivers", "Driver earnings ledger"],
        },
        {
          label: "Paid to",
          lines: [
            driverName || "Driver",
            statement.driver?.email,
            account
              ? `${account.bank_name} ····${account.account_number_last4}`
              : "No payout account on file",
          ],
        },
      ]}
      footnote="Generated from the Haya Drivers earnings ledger. Amounts on hold are released after the standard earnings hold; withdrawals go to the payout account shown. Contact support if anything on this statement looks wrong."
    >
      {!statement.lines.length ? (
        <p className="text-muted-foreground text-sm">
          No earnings or withdrawals were recorded in {period}.
        </p>
      ) : (
        <DocumentLines
          headers={["Date", "Description", "Status", "Amount"]}
          rows={statement.lines.map((line) => {
            const client = line.booking?.client;
            const clientName =
              client?.client_profile?.organisation_name ||
              [client?.first_name, client?.last_name].filter(Boolean).join(" ");

            return {
              key: line.id,
              cells: [
                formatDate(line.createdAt),
                <span key="d">
                  <span className="text-ink block font-medium">
                    {TYPE_LABELS[line.type] ?? line.type}
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    {[line.booking?.reference, clientName, line.reference]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>,
                STATUS_LABELS[line.status] ?? line.status,
                formatMoney(line.amount_minor, currency),
              ],
            };
          })}
          totals={[
            {
              label: "Earned",
              value: formatMoney(statement.totals.earned_minor, currency),
            },
            {
              label: "Withdrawals & deductions",
              value: formatMoney(statement.totals.deducted_minor, currency),
            },
            {
              label: "Still on hold",
              value: formatMoney(statement.totals.on_hold_minor, currency),
            },
            {
              label: "Net for the month",
              value: formatMoney(statement.totals.net_minor, currency),
              strong: true,
            },
          ]}
        />
      )}
    </PrintDocument>
  );
}
