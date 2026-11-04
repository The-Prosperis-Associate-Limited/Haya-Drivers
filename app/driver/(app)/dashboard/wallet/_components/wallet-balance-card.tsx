import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatMoney } from "@/lib/utils";
import type { WalletOverview } from "@/types/referral";
import { ArrowUpRight, Gift } from "lucide-react";
import Link from "next/link";

interface Props {
  wallet: WalletOverview;
  onWithdraw: () => void;
}

const nextStepMessage = function (wallet: WalletOverview) {
  const money = (minor: number) => formatMoney(minor, wallet.currency);
  const step = money(wallet.payout_step_minor);
  const remainder = wallet.payout_step_minor - wallet.to_next_step_minor;

  if (wallet.has_open_payout) {
    return "You have a withdrawal on its way. You can request another once it settles.";
  }

  if (wallet.withdrawable_minor > 0) {
    return remainder > 0
      ? `Withdrawals come in multiples of ${step}, so you can take out ${money(wallet.withdrawable_minor)} now. The other ${money(remainder)} stays here until it grows by ${money(wallet.to_next_step_minor)}.`
      : `Withdrawals come in multiples of ${step}, so you can take out ${money(wallet.withdrawable_minor)} now.`;
  }

  const count = wallet.referrals_to_next_step;

  return count > 0
    ? `Withdrawals open at ${step}. You need ${money(wallet.to_next_step_minor)} more - that's ${count} more referred driver${count === 1 ? "" : "s"}.`
    : `Withdrawals open at ${step}. Your rewards on hold will get you there once they clear.`;
};

export const WalletBalanceCard = function ({ wallet, onWithdraw }: Props) {
  const { currency } = wallet;
  const canWithdraw = !wallet.has_open_payout && wallet.withdrawable_minor > 0;
  const towardsNextStep = wallet.payout_step_minor - wallet.to_next_step_minor;

  const subs = [
    { label: "On hold", value: wallet.pending_minor },
    { label: "In transit to bank", value: wallet.in_transit_minor },
    { label: "Earned from referrals", value: wallet.referral_earned_minor },
    { label: "Withdrawn all time", value: wallet.withdrawn_minor },
  ];

  return (
    <div className="relative isolate overflow-hidden rounded-[20px] bg-[radial-gradient(120%_140%_at_100%_0%,#334e8f_0%,transparent_55%),linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] p-5 text-white sm:p-7">
      <div className="pointer-events-none absolute -right-16 -bottom-20 -z-10 size-60 rounded-full border border-white/10 shadow-[0_0_0_40px_rgba(255,255,255,0.03)]" />

      <p className="text-[13px] text-white/70">Wallet balance</p>
      <p className="mt-1.5 text-4xl font-semibold tracking-tight">
        {formatMoney(wallet.available_minor, currency)}
      </p>
      <p className="mt-1 text-[13px] text-white/70">
        {formatMoney(wallet.withdrawable_minor, currency)} available to withdraw
      </p>

      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-[11.5px] text-white/60">
          <span>Towards your next withdrawal</span>
          <span>
            {formatMoney(towardsNextStep, currency)} of{" "}
            {formatMoney(wallet.payout_step_minor, currency)}
          </span>
        </div>
        <Progress
          value={(towardsNextStep / wallet.payout_step_minor) * 100}
          className="bg-white/15"
          indicatorClassName="bg-white"
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-white/10 pt-4 sm:grid-cols-4">
        {subs.map((sub) => (
          <div key={sub.label}>
            <span className="block text-[11.5px] text-white/60">
              {sub.label}
            </span>
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

      <p className="mt-3 text-xs text-white/60">{nextStepMessage(wallet)}</p>
    </div>
  );
};
