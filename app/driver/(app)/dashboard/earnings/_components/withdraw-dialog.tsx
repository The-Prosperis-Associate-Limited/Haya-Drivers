"use client";

import { AppInput } from "@/components/shared/app-input";
import { AppSelect } from "@/components/shared/app-select";
import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import { AppDialog } from "@/components/shared/app-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Landmark, Wallet } from "lucide-react";
import { showToast } from "@/lib/show-toast";
import { formatMoney, toMajorUnits } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { useBankAccounts, useRequestWithdrawal } from "../_hooks/use-earnings";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableMinor: number;
  currency: string;
}

export const WithdrawDialog = function ({
  open,
  onOpenChange,
  availableMinor,
  currency,
}: Props) {
  const { bankAccounts } = useBankAccounts();

  const defaultAccount = bankAccounts.find((account) => account.is_default);

  const [amount, setAmount] = useState("");
  const [bankAccountId, setBankAccountId] = useState<string | null>(null);

  const { requestWithdrawal, isPending } = useRequestWithdrawal({
    onSuccess: () => {
      setAmount("");
      onOpenChange(false);
    },
  });

  const onSubmit = () => {
    const value = Number(amount);

    if (!value || value <= 0)
      return showToast("error", "Enter an amount to withdraw");
    if (value > toMajorUnits(availableMinor)) {
      return showToast(
        "error",
        `You can withdraw up to ${formatMoney(availableMinor, currency)} right now`,
      );
    }

    requestWithdrawal({
      amount: value,
      bankAccountId: bankAccountId ?? defaultAccount?.id,
    });
  };

  return (
    <AppDialog
      isOpen={open}
      onOpenChange={onOpenChange}
      title="Withdraw funds"
      description="Money goes to your confirmed bank account."
      width="480px"
      isSubmitting={isPending}
      primaryAction={
        bankAccounts.length
          ? { label: "Withdraw", onClick: onSubmit, isLoading: isPending }
          : undefined
      }
    >
      {!bankAccounts.length ? (
        <EmptyState
          size="compact"
          icon={Landmark}
          title="Add a bank account first"
          description="We confirm the account name with your bank, so your money can only land in an account that is yours."
          action={
            <Button asChild className="h-10 rounded-xl px-5">
              <Link href="/driver/dashboard/wallet">Add a bank account</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-brand-soft/60 flex items-center gap-3 rounded-xl px-4 py-3.5">
            <span className="text-brand grid size-10 shrink-0 place-items-center rounded-xl bg-white">
              <Wallet className="size-5" />
            </span>
            <div>
              <AppText
                type="caption"
                className="text-brand block text-xs font-medium"
              >
                Available to withdraw
              </AppText>
              <AppText
                type="label"
                className="block text-xl font-semibold tracking-tight"
              >
                {formatMoney(availableMinor, currency)}
              </AppText>
            </div>
          </div>

          <AppInput
            label={`Amount (${currency === "NGN" ? "₦" : currency})`}
            type="number"
            min={0}
            placeholder="0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />

          <AppSelect
            label="Pay into"
            options={bankAccounts.map((account) => ({
              value: account.id,
              label: `${account.bank_name} · ${account.account_number}`,
            }))}
            value={bankAccountId ?? defaultAccount?.id ?? null}
            onValueChange={setBankAccountId}
          />
        </div>
      )}
    </AppDialog>
  );
};
