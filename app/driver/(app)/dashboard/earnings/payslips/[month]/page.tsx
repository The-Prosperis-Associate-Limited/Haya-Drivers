"use client";

import {
  DocumentLines,
  PrintDocument,
} from "@/components/shared/print-document";
import { salaryStatus } from "@/components/salary/salary-payments";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate, formatMoney } from "@/lib/utils";
import { use } from "react";
import type { APIResponse } from "@/types/response";
import type { EarningsStatement } from "@/types/earnings";

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
  const clients = [...new Set(statement.lines.map((line) => line.client.name))];

  return (
    <PrintDocument
      title="Payslip"
      reference={statement.reference}
      backHref="/driver/dashboard/earnings"
      backLabel="Earnings"
      meta={[
        { label: "Pay month", value: period },
        { label: "Issued", value: formatDate(statement.generated_at) },
      ]}
      parties={[
        {
          label: "Paid by",
          lines: clients.length ? clients : ["No payments this month"],
        },
        {
          label: "Paid to",
          lines: [driverName || "Driver", statement.driver?.email],
        },
      ]}
      footnote="Salaries are paid by each client directly to the driver; Haya Drivers records each payment and the driver's confirmation of it. Lines marked as awaiting confirmation were reported paid by the client but not yet confirmed by the driver."
    >
      {!statement.lines.length ? (
        <p className="text-muted-foreground text-sm">
          No salary payments were recorded in {period}.
        </p>
      ) : (
        <DocumentLines
          headers={["Paid", "Engagement", "Status", "Amount"]}
          rows={statement.lines.map((line) => ({
            key: line.id,
            cells: [
              line.paid_at ? formatDate(line.paid_at) : "-",
              <span key="d">
                <span className="text-ink block font-medium">
                  Salary, {line.period_label}
                </span>
                <span className="text-muted-foreground block text-xs">
                  {[line.client.name, line.booking.reference].join(" · ")}
                </span>
              </span>,
              line.status === "PAID"
                ? "Awaiting confirmation"
                : salaryStatus(line, "driver").label,
              formatMoney(line.amount_minor, line.currency),
            ],
          }))}
          totals={[
            {
              label: "Confirmed received",
              value: formatMoney(statement.totals.received_minor, currency),
            },
            {
              label: "Awaiting confirmation",
              value: formatMoney(statement.totals.awaiting_minor, currency),
            },
            {
              label: "Total for the month",
              value: formatMoney(statement.totals.total_minor, currency),
              strong: true,
            },
          ]}
        />
      )}
    </PrintDocument>
  );
}
