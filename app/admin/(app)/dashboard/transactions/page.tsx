"use client";

import { AppText } from "@/components/shared/app-text";
import { StatCard } from "@/components/shared/stat-card";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatMoneyCompact } from "@/lib/utils";
import { Hourglass, TriangleAlert, Wallet } from "lucide-react";
import type { APIResponse } from "@/types/response";
import type { AdminTransactionStats } from "@/types/admin";
import { PayoutsTab } from "./_components/payouts-tab";

// Client wallets and wallet service fees were retired with the direct-salary
// pivot - the money that still moves through us is driver payouts of
// historical wallet balances, so that is all this page tracks.
export default function AdminTransactions() {
  const { data } = useGetData<APIResponse<AdminTransactionStats>>({
    url: API_ENDPOINTS.adminTransactions.stats,
  });

  const stats = data?.data;
  const currency = stats?.currency ?? "NGN";

  return (
    <div className="mx-auto max-w-[1360px] space-y-6">
      <div>
        <AppText type="h2" className="text-[22px] font-semibold tracking-tight">
          Payouts
        </AppText>
        <AppText type="subtitle" className="text-muted-foreground text-[13px]">
          Driver withdrawals of historical wallet balances. Hire revenue lives
          on each invoice under Hires.
        </AppText>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3 xl:gap-4">
        <StatCard
          icon={Wallet}
          tone="green"
          label="Paid to drivers"
          value={
            stats
              ? formatMoneyCompact(stats.paid_to_drivers_minor, currency)
              : "-"
          }
          caption={stats ? `${stats.paid_payouts} settled payouts` : " "}
          captionTone="muted"
        />
        <StatCard
          icon={Hourglass}
          tone="amber"
          label="Awaiting release"
          value={stats ? String(stats.awaiting_release.count) : "-"}
          caption={
            stats
              ? `${formatMoneyCompact(stats.awaiting_release.amount_minor, currency)} escrowed`
              : " "
          }
          captionTone="muted"
        />
        <StatCard
          icon={TriangleAlert}
          tone="violet"
          label="Failed payments"
          value={stats ? String(stats.failed_payouts) : "-"}
          caption={
            stats && stats.failed_payouts > 0 ? "Need attention" : "All clear"
          }
          captionTone={stats && stats.failed_payouts > 0 ? "warning" : "muted"}
        />
      </div>

      <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
        <PayoutsTab />
      </div>
    </div>
  );
}
