"use client";

import { AppTabs } from "@/components/shared/app-tabs";
import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn, formatDate, formatDateTime, formatMoney } from "@/lib/utils";
import type { WalletLedgerEntry } from "@/types/referral";
import type { PaginatedResponse } from "@/types/response";
import { Briefcase, Gift, Landmark, ReceiptText, Undo2, type LucideIcon } from "lucide-react";
import { useState } from "react";

type Filter = "all" | "referrals" | "withdrawals";

const ICONS: Partial<Record<WalletLedgerEntry["type"], { icon: LucideIcon; tone: string }>> = {
  REFERRAL_BONUS: { icon: Gift, tone: "bg-violet-50 text-violet-600" },
  PAYOUT: { icon: Landmark, tone: "bg-muted text-foreground" },
  PAYOUT_REVERSAL: { icon: Undo2, tone: "bg-red-50 text-red-600" },
  BOOKING_PAYMENT: { icon: Briefcase, tone: "bg-emerald-50 text-emerald-600" },
};

const statusChip = function (entry: WalletLedgerEntry) {
  if (entry.payout) {
    const map = {
      REQUESTED: ["Processing", "bg-amber-50 text-amber-700"],
      PROCESSING: ["Processing", "bg-amber-50 text-amber-700"],
      PAID: ["Paid", "bg-emerald-50 text-emerald-700"],
      FAILED: ["Failed", "bg-red-50 text-red-600"],
      REVERSED: ["Returned", "bg-muted text-muted-foreground"],
    } as const;
    return map[entry.payout.status];
  }
  if (entry.status === "REVERSED") return ["Reversed", "bg-red-50 text-red-600"] as const;
  if (entry.status === "PENDING")
    return [
      entry.available_at ? `On hold until ${formatDate(entry.available_at)}` : "On hold",
      "bg-amber-50 text-amber-700",
    ] as const;
  if (entry.amount_minor > 0) return ["Available", "bg-emerald-50 text-emerald-700"] as const;
  return null;
};

const titleOf = function (entry: WalletLedgerEntry) {
  if (entry.payout?.bank_name)
    return `Withdrawal to ${entry.payout.bank_name}${entry.payout.account_last4 ? ` ••••${entry.payout.account_last4}` : ""}`;
  return entry.description ?? entry.type.replace(/_/g, " ").toLowerCase();
};

export const WalletLedger = function () {
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);

  const { data, isFetching } = useGetData<PaginatedResponse<WalletLedgerEntry>>({
    url: API_ENDPOINTS.driverWallet.transactions({
      page,
      limit: 10,
      type: filter === "all" ? undefined : filter,
    }),
  });

  const entries = data?.data ?? [];

  return (
    <section className="border-border rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 pb-0 md:p-5 md:pb-0">
        <div>
          <AppText type="h4" className="text-[15px] font-semibold">
            Transactions
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            Every credit and debit, newest first
          </AppText>
        </div>
        <AppTabs
          variant="compact"
          value={filter}
          onValueChange={(value) => {
            setFilter(value);
            setPage(1);
          }}
          tabs={[
            { value: "all", label: "All" },
            { value: "referrals", label: "Referrals" },
            { value: "withdrawals", label: "Withdrawals" },
          ]}
        />
      </div>

      <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} isLoading={isFetching}>
        <div className="mt-3">
          {isFetching && !entries.length ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : !entries.length ? (
            <EmptyState
              icon={ReceiptText}
              title="Nothing here yet."
              description="Referral rewards and withdrawals will show up here."
            />
          ) : (
            <ul className="divide-border divide-y">
              {entries.map((entry) => {
                const visual = ICONS[entry.type] ?? { icon: ReceiptText, tone: "bg-muted text-foreground" };
                const Icon = visual.icon;
                const chip = statusChip(entry);

                return (
                  <li key={entry.id} className="flex items-center gap-3 px-4 py-3 md:px-5">
                    <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", visual.tone)}>
                      <Icon className="size-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold">{titleOf(entry)}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {entry.payout?.failure_reason ?? formatDateTime(entry.created_at)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={cn("text-[13.5px] font-semibold", entry.amount_minor > 0 && "text-emerald-600")}>
                        {entry.amount_minor > 0 ? "+" : ""}
                        {formatMoney(entry.amount_minor, entry.currency)}
                      </p>
                      {chip && (
                        <span className={cn("mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold", chip[1])}>
                          {chip[0]}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Pagination>
    </section>
  );
};
