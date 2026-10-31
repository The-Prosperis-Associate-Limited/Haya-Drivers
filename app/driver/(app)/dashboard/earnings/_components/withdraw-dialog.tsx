"use client";

import { AppInput } from "@/components/shared/app-input";
import { AppSelect } from "@/components/shared/app-select";
import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import { AppDialog } from "@/components/shared/app-dialog";
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
      isSubmitting={isPending}
      dialogFooter={
        !!bankAccounts.length && (
          <>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-lg px-5"
            >
              Cancel
            </Button>
            <Button
              isLoading={isPending}
              onClick={onSubmit}
              className="h-10 rounded-lg px-5"
            >
              Withdraw
            </Button>
          </>
        )
      }
    >
      {!bankAccounts.length ? (
        <div className="space-y-4 py-2">
          <AppText type="body" className="text-muted-foreground">
            Add a bank account before withdrawing. We confirm the account name
            with your bank, so your money can only land in an account that is
            yours.
          </AppText>

          <Button asChild className="h-11 w-full rounded-lg">
            <Link href="/driver/dashboard/wallet">Add a bank account</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4 py-2">
          <AppText type="caption" className="text-muted-foreground block">
            Available to withdraw:{" "}
            <span className="text-foreground font-semibold">
              {formatMoney(availableMinor, currency)}
            </span>
          </AppText>

          <AppInput
            label="Amount"
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
