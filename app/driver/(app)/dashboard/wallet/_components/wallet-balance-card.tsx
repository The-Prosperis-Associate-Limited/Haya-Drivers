import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import type { WalletOverview } from "@/types/referral";
import { ArrowUpRight, Gift } from "lucide-react";
import Link from "next/link";

interface Props {
  wallet: WalletOverview;
  onWithdraw: () => void;
}

export const WalletBalanceCard = function ({ wallet, onWithdraw }: Props) {
  const { currency } = wallet;
  const canWithdraw =
    !wallet.has_open_payout &&
    wallet.available_minor >= wallet.minimum_payout_minor;

  const subs = [
    { label: "On hold", value: wallet.pending_minor },
    { label: "In transit to bank", value: wallet.in_transit_minor },
    { label: "Earned from referrals", value: wallet.referral_earned_minor },
    { label: "Withdrawn all time", value: wallet.withdrawn_minor },
  ];

  return (
    <div className="relative isolate overflow-hidden rounded-[20px] bg-[radial-gradient(120%_140%_at_100%_0%,#334e8f_0%,transparent_55%),linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] p-5 text-white sm:p-7">
      <div className="pointer-events-none absolute -right-16 -bottom-20 -z-10 size-60 rounded-full border border-white/10 shadow-[0_0_0_40px_rgba(255,255,255,0.03)]" />

      <p className="text-[13px] text-white/70">Available to withdraw</p>
      <p className="mt-1.5 text-4xl font-semibold tracking-tight">
        {formatMoney(wallet.available_minor, currency)}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-white/10 pt-4 sm:grid-cols-4">
        {subs.map((sub) => (
          <div key={sub.label}>
            <span className="block text-[11.5px] text-white/60">{sub.label}</span>
            <span className="text-[15px] font-semibold">
              {formatMoney(sub.value, currency)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Button
          onClick={onWithdraw}
          disabled={!canWithdraw}
          className="text-brand h-10 rounded-xl bg-white px-4 hover:bg-white/90"
        >
          <ArrowUpRight className="size-4" />
          Withdraw
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-10 rounded-xl border-white/30 bg-white/10 px-4 text-white hover:bg-white/20 hover:text-white"
        >
          <Link href="/driver/dashboard/referrals">
            <Gift className="size-4" />
            Earn more
          </Link>
        </Button>
      </div>

      {wallet.has_open_payout ? (
        <p className="mt-3 text-xs text-white/60">
          You have a withdrawal on its way. You can request another once it
          settles.
        </p>
      ) : (
        wallet.available_minor < wallet.minimum_payout_minor && (
          <p className="mt-3 text-xs text-white/60">
            The minimum withdrawal is{" "}
            {formatMoney(wallet.minimum_payout_minor, currency)}.
          </p>
        )
      )}
    </div>
  );
};
