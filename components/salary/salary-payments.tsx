import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatMoney } from "@/lib/utils";
import { Banknote, ExternalLink } from "lucide-react";
import type {
  SalaryPayment,
  SalaryPaymentStatus,
  SalarySchedule,
} from "@/types/salary";

export type SalaryViewer = "client" | "driver" | "admin";

const TONES = {
  due: "border-slate-200 bg-slate-50 text-slate-600",
  overdue: "border-red-200 bg-red-50 text-red-700",
  waiting: "border-amber-200 bg-amber-50 text-amber-700",
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  disputed: "border-red-200 bg-red-50 text-red-700",
} as const;

const PAID_LABEL: Record<SalaryViewer, string> = {
  client: "Awaiting driver",
  driver: "Client says paid",
  admin: "Awaiting driver",
};

export const salaryStatus = function (
  payment: Pick<SalaryPayment, "status" | "overdue">,
  viewer: SalaryViewer,
) {
  const byStatus: Record<
    SalaryPaymentStatus,
    { label: string; className: string }
  > = {
    DUE: payment.overdue
      ? { label: "Overdue", className: TONES.overdue }
      : { label: "Due", className: TONES.due },
    PAID: { label: PAID_LABEL[viewer], className: TONES.waiting },
    CONFIRMED: { label: "Confirmed", className: TONES.confirmed },
    DISPUTED: { label: "Disputed", className: TONES.disputed },
  };

  return byStatus[payment.status];
};

export const SalaryStatusBadge = function ({
  payment,
  viewer,
}: {
  payment: Pick<SalaryPayment, "status" | "overdue">;
  viewer: SalaryViewer;
}) {
  const { label, className } = salaryStatus(payment, viewer);

  return <StatusBadge label={label} className={className} />;
};

export const payBasis = function (
  schedule: Pick<
    SalarySchedule,
    "engagement_type" | "amount_minor" | "currency" | "ends_at"
  >,
) {
  const amount = formatMoney(schedule.amount_minor, schedule.currency);

  if (schedule.engagement_type === "CONTRACT" && schedule.ends_at) {
    return `${amount} for the whole contract, due when it ends on ${formatDate(schedule.ends_at)}`;
  }

  return `${amount} a month, due at the end of each month of the engagement`;
};

interface Props {
  schedule: SalarySchedule | undefined;
  isFetching: boolean;
  viewer: SalaryViewer;
  intro: string;
  renderActions?: (payment: SalaryPayment) => React.ReactNode;
}

export const SalaryPayments = function ({
  schedule,
  isFetching,
  viewer,
  intro,
  renderActions,
}: Props) {
  return (
    <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <AppText type="h4" className="text-[15px] font-semibold">
            Salary payments
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            {schedule ? payBasis(schedule) : intro}
          </AppText>
        </div>
        {schedule && schedule.summary.confirmed_minor > 0 && (
          <span className="text-right">
            <AppText
              type="caption"
              className="text-muted-foreground block text-xs"
            >
              Confirmed so far
            </AppText>
            <AppText type="label" className="text-sm font-semibold">
              {formatMoney(schedule.summary.confirmed_minor, schedule.currency)}
            </AppText>
          </span>
        )}
      </div>

      {schedule && (
        <AppText
          type="caption"
          className="text-muted-foreground mt-3 block text-xs"
        >
          {intro}
        </AppText>
      )}

      <div className="mt-4">
        {isFetching && !schedule ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : !schedule?.payments.length ? (
          <EmptyState
            icon={Banknote}
            title="No pay periods yet."
            description="The first one opens when the engagement starts."
          />
        ) : (
          <ul className="divide-border border-border divide-y overflow-hidden rounded-xl border">
            {schedule.payments.map((payment) => (
              <li key={payment.id} className="space-y-2 p-3 md:p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <AppText type="label" className="block text-sm">
                      {payment.period_label}
                    </AppText>
                    <AppText
                      type="caption"
                      className="text-muted-foreground block text-xs"
                    >
                      {payment.status === "DUE"
                        ? `Due ${formatDate(payment.due_at)}`
                        : payment.paid_at
                          ? `Paid ${formatDate(payment.paid_at)}`
                          : `Due ${formatDate(payment.due_at)}`}
                    </AppText>
                  </div>
                  <span className="flex items-center gap-3">
                    <AppText type="label" className="text-sm font-semibold">
                      {formatMoney(payment.amount_minor, payment.currency)}
                    </AppText>
                    <SalaryStatusBadge payment={payment} viewer={viewer} />
                  </span>
                </div>

                <SalaryDetails payment={payment} />

                {renderActions && (
                  <div className="flex flex-wrap gap-2 empty:hidden">
                    {renderActions(payment)}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export const SalaryDetails = function ({
  payment,
}: {
  payment: SalaryPayment;
}) {
  const lines = [
    payment.client_note && `Client's note: "${payment.client_note}"`,
    payment.dispute_reason &&
      `Reported by the driver: "${payment.dispute_reason}"`,
    payment.resolution_note &&
      `${payment.resolution === "PAID" ? "Our team confirmed the payment" : "Our team found it unpaid"}: ${payment.resolution_note}`,
  ].filter(Boolean) as string[];

  if (!lines.length && !payment.receipt_url) return null;

  return (
    <div className="space-y-1">
      {lines.map((line) => (
        <AppText
          key={line}
          type="caption"
          className="text-muted-foreground block text-xs"
        >
          {line}
        </AppText>
      ))}
      {payment.receipt_url && (
        <a
          href={payment.receipt_url}
          target="_blank"
          rel="noreferrer"
          className="text-brand inline-flex items-center gap-1 text-xs font-medium hover:underline"
        >
          View receipt <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
};
