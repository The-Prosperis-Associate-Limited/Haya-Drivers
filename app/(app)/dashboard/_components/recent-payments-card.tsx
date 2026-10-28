import { AppText } from "@/components/shared/app-text";
import { formatDate, formatMoney } from "@/lib/utils";
import { ChevronRight, Receipt } from "lucide-react";
import Link from "next/link";
import type { OverviewData } from "@/types/booking";

interface Props {
  payments: OverviewData["recent_payments"];
}

export const RecentPaymentsCard = function ({ payments }: Props) {
  return (
    <div className="border-border rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-2 px-4 pt-4 md:px-5 md:pt-5">
        <div>
          <AppText type="h4" className="text-[15px] font-semibold">
            Recent payments
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            Invoices confirmed by our team
          </AppText>
        </div>
        <Link
          href="/dashboard/my-hire"
          className="text-brand inline-flex shrink-0 items-center gap-0.5 text-[13px] font-semibold"
        >
          My hire
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {!payments.length ? (
        <AppText
          type="caption"
          className="text-muted-foreground block px-4 pt-3 pb-5 md:px-5"
        >
          No payments yet. Paid invoices land here once we confirm your
          transfer.
        </AppText>
      ) : (
        <div className="mt-2">
          {payments.map((payment) => (
            <Link
              key={payment.id}
              href={`/dashboard/my-hire/requests/${payment.hire_request.reference}`}
              className="flex items-center gap-3 border-t border-slate-100 px-4 py-3 transition-colors first:border-t-0 hover:bg-slate-50 md:px-5"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-emerald-50 text-emerald-600">
                <Receipt className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <AppText
                  type="label"
                  className="block truncate text-[13px] font-semibold"
                >
                  {payment.reference}
                </AppText>
                <AppText
                  type="caption"
                  className="text-muted-foreground block truncate"
                >
                  {payment.hire_request.drivers_needed} driver
                  {payment.hire_request.drivers_needed > 1 ? "s" : ""} · Paid{" "}
                  {formatDate(payment.paid_at)}
                </AppText>
              </span>
              <span className="shrink-0 text-right">
                <AppText
                  type="label"
                  className="block text-[13px] font-semibold"
                >
                  {formatMoney(payment.total_minor, payment.currency)}
                </AppText>
                <span className="text-[11px] font-semibold text-emerald-600">
                  Paid
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
