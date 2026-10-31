"use client";

import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { useGetData } from "@/hooks/use-get-data";
import { statusBadgeClass, statusLabel } from "@/lib/admin";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate, formatMoney } from "@/lib/utils";
import { useState } from "react";
import type { APIResponse } from "@/types/response";
import type { AdminUserWalletData } from "@/types/admin";

interface Props {
  userId: string;
}

export const UserWallet = function ({ userId }: Props) {
  const [page, setPage] = useState(1);

  const { data, isFetching } = useGetData<APIResponse<AdminUserWalletData>>({
    url: API_ENDPOINTS.adminUsers.wallet(userId, { page, limit: 10 }),
  });

  const wallet = data?.data.wallet;
  const transactions = data?.data.transactions;
  const currency = wallet?.currency ?? "NGN";

  return (
    <div className="space-y-6">
      <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
        <AppText
          type="label"
          className="text-muted-foreground tracking-wide uppercase"
        >
          Wallet balance
        </AppText>
        <AppText type="h2" className="mt-2 text-3xl font-bold" as="p">
          {formatMoney(wallet?.available_minor ?? 0, currency)}
        </AppText>
        {(wallet?.pending_minor ?? 0) > 0 && (
          <AppText type="caption" className="mt-1 block text-amber-600">
            Pending: {formatMoney(wallet?.pending_minor ?? 0, currency)}
          </AppText>
        )}
      </div>

      <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
        <AppText
          type="label"
          className="text-foreground font-semibold tracking-wide uppercase"
        >
          Transaction history
        </AppText>

        <Pagination
          page={page}
          totalPages={transactions?.totalPages ?? 1}
          onPageChange={setPage}
          total={transactions?.total}
          isLoading={isFetching}
        >
          {!transactions?.data.length ? (
            <EmptyState
              title="No transactions yet"
              description="Money that moves through this wallet shows up here."
            />
          ) : (
            <>
              <div className="mt-4 hidden overflow-x-auto md:block">
                <table className="w-full text-sm [&_td:first-child]:pl-3 [&_th]:py-2.5 [&_th:first-child]:pl-3">
                  <thead>
                    <tr className="bg-slate-50 text-left text-[11.5px] font-semibold tracking-wide text-slate-500 uppercase">
                      <th className="py-3 pr-4 font-medium">Date</th>
                      <th className="py-3 pr-4 font-medium">Type</th>
                      <th className="py-3 pr-4 font-medium">Description</th>
                      <th className="py-3 pr-4 font-medium">Status</th>
                      <th className="py-3 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {transactions.data.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="text-muted-foreground py-3 pr-4">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge
                            label={
                              transaction.amount_minor >= 0 ? "Credit" : "Debit"
                            }
                            className={
                              transaction.amount_minor >= 0
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-red-200 bg-red-50 text-red-700"
                            }
                          />
                        </td>
                        <td className="text-muted-foreground max-w-xs truncate py-3 pr-4">
                          {transaction.description ??
                            statusLabel(transaction.type)}
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge
                            label={statusLabel(transaction.status)}
                            className={statusBadgeClass(transaction.status)}
                          />
                        </td>
                        <td
                          className={`py-3 text-right font-semibold ${
                            transaction.amount_minor >= 0
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.amount_minor >= 0 ? "+" : "−"}
                          {formatMoney(
                            Math.abs(transaction.amount_minor),
                            transaction.currency,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 space-y-3 md:hidden">
                {transactions.data.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="border-border rounded-xl border p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <AppText type="caption" className="font-semibold">
                        {transaction.description ??
                          statusLabel(transaction.type)}
                      </AppText>
                      <span
                        className={`text-sm font-semibold ${
                          transaction.amount_minor >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.amount_minor >= 0 ? "+" : "−"}
                        {formatMoney(
                          Math.abs(transaction.amount_minor),
                          transaction.currency,
                        )}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {formatDate(transaction.createdAt)} ·{" "}
                      {statusLabel(transaction.status)}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </Pagination>
      </div>
    </div>
  );
};
