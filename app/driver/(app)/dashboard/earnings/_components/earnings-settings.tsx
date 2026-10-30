"use client";

import { SalaryStatusBadge } from "@/components/salary/salary-payments";
import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatMoney } from "@/lib/utils";
import { AlertTriangle, Banknote, Hourglass, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { SalaryPaymentWithParties } from "@/types/salary";
import { BankAccounts } from "./bank-accounts";
import { EarningsTrend } from "./earnings-trend";
import { PayslipsCard } from "./payslips-card";
import { WithdrawDialog } from "./withdraw-dialog";
import {
  useEarningsHistory,
  useEarningsSummary,
  useEarningsTrend,
} from "../_hooks/use-earnings";

const jobHref = (payment: SalaryPaymentWithParties) =>
  `/driver/dashboard/job-request/${payment.booking.reference}`;

const dateLine = (payment: SalaryPaymentWithParties) =>
  payment.status === "DUE" || !payment.paid_at
    ? `Due ${formatDate(payment.due_at)}`
    : `Paid ${formatDate(payment.paid_at)}`;

export const EarningsSettings = function () {
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { summary, isFetching } = useEarningsSummary();
  const {
    payments,
    totalPages,
    isFetching: isFetchingHistory,
  } = useEarningsHistory({ page, limit: 10 });
  const { trend } = useEarningsTrend();

  const currency = summary?.currency ?? "NGN";
  const wallet = summary?.wallet;
  const hasWallet =
    !!wallet && wallet.available_minor + wallet.pending_minor > 0;

  return (
    <div className="space-y-5 lg:space-y-6">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
        {isFetching && !summary ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard
              icon={Wallet}
              tone="green"
              label="Salary received"
              value={formatMoney(summary?.received_minor, currency)}
              caption="Payments you've confirmed"
              captionTone="muted"
            />
            <StatCard
              icon={Hourglass}
              tone="amber"
              label="Waiting for you"
              value={formatMoney(
                summary?.awaiting_confirmation_minor,
                currency,
              )}
              caption={
                summary?.awaiting_confirmation_count
                  ? `${summary.awaiting_confirmation_count} payment${summary.awaiting_confirmation_count === 1 ? "" : "s"} the client marked as paid - confirm or report`
                  : "Nothing to confirm"
              }
              captionTone="muted"
            />
            <StatCard
              icon={AlertTriangle}
              tone={summary?.overdue_count ? "red" : "brand"}
              label={summary?.overdue_count ? "Overdue" : "Coming up"}
              value={formatMoney(
                summary?.overdue_count
                  ? summary.overdue_minor
                  : summary?.due_minor,
                currency,
              )}
              caption={
                summary?.overdue_count
                  ? `${summary.overdue_count} unpaid - we've reminded the client`
                  : summary?.disputed_count
                    ? `${summary.disputed_count} under review by our team`
                    : "Salary due on your current jobs"
              }
              captionTone="muted"
            />
          </>
        )}
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start xl:gap-6">
        <div className="min-w-0 space-y-5 xl:space-y-6">
          <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
            <AppText type="h4" className="text-[15px] font-semibold">
              Salary received
            </AppText>
            <AppText type="caption" className="text-muted-foreground block">
              Confirmed payments, last 12 months
            </AppText>
            <div className="mt-3">
              <EarningsTrend trend={trend} currency={currency} />
            </div>
          </div>

          <div className="space-y-3">
            <AppText type="h4" className="text-[15px] font-semibold">
              Salary payments
            </AppText>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              limit={10}
              isLoading={isFetchingHistory}
            >
              <div className="border-border overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                {isFetchingHistory && !payments.length ? (
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : !payments.length ? (
                  <EmptyState
                    icon={Banknote}
                    title="No salary payments yet."
                    description="Each pay period of your jobs shows up here, with whether the client has paid it."
                  />
                ) : (
                  <>
                    <div className="divide-border divide-y sm:hidden">
                      {payments.map((payment) => (
                        <Link
                          key={payment.id}
                          href={jobHref(payment)}
                          className="block space-y-2 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="min-w-0">
                              <AppText type="label" className="block">
                                {payment.client.name}
                              </AppText>
                              <AppText
                                type="caption"
                                className="text-muted-foreground block"
                              >
                                {payment.period_label}
                              </AppText>
                            </span>
                            <AppText type="label">
                              {formatMoney(
                                payment.amount_minor,
                                payment.currency,
                              )}
                            </AppText>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <AppText
                              type="caption"
                              className="text-muted-foreground"
                            >
                              {dateLine(payment)}
                            </AppText>
                            <SalaryStatusBadge
                              payment={payment}
                              viewer="driver"
                            />
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="hidden overflow-x-auto sm:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Period</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {payments.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>
                                <Link
                                  href={jobHref(payment)}
                                  className="hover:text-brand font-medium"
                                >
                                  {payment.period_label}
                                </Link>
                                <span className="text-muted-foreground block text-xs">
                                  {payment.booking.reference}
                                </span>
                              </TableCell>
                              <TableCell>{payment.client.name}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {dateLine(payment)}
                              </TableCell>
                              <TableCell>
                                <SalaryStatusBadge
                                  payment={payment}
                                  viewer="driver"
                                />
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatMoney(
                                  payment.amount_minor,
                                  payment.currency,
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </div>
            </Pagination>
          </div>
        </div>

        <div className="min-w-0 space-y-5 xl:space-y-6">
          <PayslipsCard trend={trend} currency={currency} />

          {hasWallet && (
            <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
              <AppText type="h4" className="text-[15px] font-semibold">
                Old wallet balance
              </AppText>
              <AppText type="caption" className="text-muted-foreground block">
                Earnings Haya Drivers held for you before clients started paying
                salaries directly. You can still withdraw it.
              </AppText>
              <div className="mt-4 flex items-end justify-between gap-3">
                <span>
                  <AppText
                    type="h2"
                    as="p"
                    className="text-[22px] font-semibold tracking-tight"
                  >
                    {formatMoney(wallet.available_minor, currency)}
                  </AppText>
                  {wallet.pending_minor > 0 && (
                    <AppText
                      type="caption"
                      className="text-muted-foreground block"
                    >
                      {formatMoney(wallet.pending_minor, currency)} on hold
                    </AppText>
                  )}
                </span>
                <Button
                  onClick={() => setWithdrawOpen(true)}
                  disabled={!wallet.available_minor}
                  className="h-9 rounded-lg px-4 text-xs"
                >
                  Withdraw
                </Button>
              </div>
            </div>
          )}

          {hasWallet && (
            <div className="space-y-3">
              <AppText type="h4" className="text-[15px] font-semibold">
                Payout accounts
              </AppText>
              <BankAccounts />
            </div>
          )}
        </div>
      </div>

      <WithdrawDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        availableMinor={wallet?.available_minor ?? 0}
        currency={currency}
      />
    </div>
  );
};
