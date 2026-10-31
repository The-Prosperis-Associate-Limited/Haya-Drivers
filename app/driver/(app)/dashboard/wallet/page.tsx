"use client";

import { AppText } from "@/components/shared/app-text";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { WalletOverview } from "@/types/referral";
import type { APIResponse } from "@/types/response";
import { Info, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BankAccounts } from "../earnings/_components/bank-accounts";
import { WithdrawDialog } from "../earnings/_components/withdraw-dialog";
import { WalletBalanceCard } from "./_components/wallet-balance-card";
import { WalletLedger } from "./_components/wallet-ledger";

export default function Wallet() {
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const { data } = useGetData<APIResponse<WalletOverview>>({
    url: API_ENDPOINTS.driverWallet.summary,
  });

  const wallet = data?.data;

  return (
    <div className="mx-auto max-w-[1360px] space-y-5 lg:space-y-6">
      <PageHeader
        title="Wallet"
        subtitle="Referral rewards and any balance from before direct salaries - withdraw it to your bank any time."
        className="mb-0"
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start xl:gap-6">
        {wallet ? (
          <WalletBalanceCard wallet={wallet} onWithdraw={() => setWithdrawOpen(true)} />
        ) : (
          <Skeleton className="h-64 rounded-[20px]" />
        )}

        <div className="border-border space-y-3 rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
          <div>
            <AppText type="h4" className="text-[15px] font-semibold">
              Payout account
            </AppText>
            <AppText type="caption" className="text-muted-foreground block">
              Withdrawals go to your default account
            </AppText>
          </div>
          <BankAccounts />
          <p className="bg-muted/60 flex gap-2 rounded-lg p-3 text-xs">
            <ShieldCheck className="text-brand size-4 shrink-0" />
            The account name is confirmed with your bank, not typed by you - so
            a typo can never send your money to a stranger.
          </p>
        </div>
      </section>

      <p className="border-border flex gap-2.5 rounded-xl border bg-white p-3.5 text-[13px]">
        <Info className="text-brand mt-0.5 size-4 shrink-0" />
        <span>
          Salaries from clients are paid straight to your bank and tracked under{" "}
          <Link href="/driver/dashboard/earnings" className="text-brand font-semibold">
            Earnings
          </Link>
          . Referral rewards are held for a few days before you can withdraw them.
        </span>
      </p>

      <WalletLedger />

      <WithdrawDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        availableMinor={wallet?.available_minor ?? 0}
        currency={wallet?.currency ?? "NGN"}
      />
    </div>
  );
}
