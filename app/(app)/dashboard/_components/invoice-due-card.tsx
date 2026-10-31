import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import { cn, formatDate, formatMoney, invoiceLines } from "@/lib/utils";
import {
  CircleCheckBig,
  Download,
  Clock,
  CreditCard,
  Eye,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import type { OverviewData } from "@/types/booking";

interface Props {
  due: OverviewData["invoice_due"];
}

const CARD =
  "border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5";

export const InvoiceDueCard = function ({ due }: Props) {
  if (!due) {
    return (
      <div
        className={cn(CARD, "flex flex-col items-start justify-center gap-3")}
      >
        <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
          <CircleCheckBig className="size-5" />
        </span>
        <div>
          <AppText type="h4" className="text-[15px] font-semibold">
            You're all paid up
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            Invoices for new hire requests will show up here with everything you
            need to pay them.
          </AppText>
        </div>
        <Button asChild variant="outline" className="h-10 rounded-xl px-4">
          <Link href="/dashboard/my-hire">View my hires</Link>
        </Button>
      </div>
    );
  }

  const { invoice } = due;
  const rejected = !!invoice.proof_rejected_reason && due.status === "INVOICED";
  const inReview = due.status === "PAYMENT_REVIEW";
  const href = `/dashboard/my-hire/requests/${due.reference}`;

  return (
    <div className={cn(CARD, "flex flex-col gap-4")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <AppText type="caption" className="text-muted-foreground block">
            {inReview ? "Payment under review" : "Invoice due"} ·{" "}
            {invoice.reference}
          </AppText>
          <AppText
            type="h2"
            as="p"
            className="text-[26px] font-semibold tracking-tight"
          >
            {formatMoney(invoice.total_minor, invoice.currency)}
          </AppText>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold",
            rejected
              ? "bg-red-50 text-red-600"
              : inReview
                ? "bg-brand-soft text-brand"
                : "bg-amber-50 text-amber-700",
          )}
        >
          {rejected ? (
            <TriangleAlert className="size-3.5" />
          ) : (
            <Clock className="size-3.5" />
          )}
          {rejected ? "Proof rejected" : inReview ? "Checking" : "Unpaid"}
        </span>
      </div>

      <dl className="space-y-2 border-y border-dashed border-slate-200 py-3">
        {invoiceLines(invoice).map((line) => (
          <div
            key={line.label}
            className="flex items-start justify-between gap-3 text-[13px]"
          >
            <dt className="text-muted-foreground">{line.label}</dt>
            <dd className="text-ink shrink-0 font-medium">
              {formatMoney(line.amount_minor, invoice.currency)}
            </dd>
          </div>
        ))}
      </dl>

      <AppText type="caption" className="text-muted-foreground block">
        {rejected
          ? `Your last proof was rejected: ${invoice.proof_rejected_reason}`
          : inReview
            ? `Proof sent ${invoice.proof_submitted_at ? formatDate(invoice.proof_submitted_at) : ""} - we'll confirm once the transfer lands.`
            : `For ${due.drivers_needed} driver${due.drivers_needed > 1 ? "s" : ""} on ${due.reference}. Transfer the total, then upload your proof of payment.`}
      </AppText>

      <div className="mt-auto flex gap-2">
        <Button asChild className="h-10 flex-1 rounded-xl px-4">
          <Link href={href}>
            {inReview ? (
              <Eye className="size-4" />
            ) : (
              <CreditCard className="size-4" />
            )}
            {inReview
              ? "View request"
              : rejected
                ? "Upload new proof"
                : "Pay now"}
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-10 rounded-xl px-4">
          <Link href={`/dashboard/billing/${due.reference}`}>
            <Download className="size-4" />
            PDF
          </Link>
        </Button>
      </div>
    </div>
  );
};
