"use client";

import { FormNumberStepper } from "@/components/form/form-choices";
import { AppDialog } from "@/components/shared/app-dialog";
import { AppSelect } from "@/components/shared/app-select";
import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { formatMoney, toMajorUnits } from "@/lib/utils";
import { Landmark, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useBankAccounts, useRequestWithdrawal } from "../_hooks/use-earnings";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  withdrawableMinor: number;
  stepMinor: number;
  currency: string;
}

export const WithdrawDialog = function ({
  open,
  onOpenChange,
  withdrawableMinor,
  stepMinor,
  currency,
}: Props) {
  const { bankAccounts } = useBankAccounts();

  const defaultAccount =
    bankAccounts.find((account) => account.is_default) ?? bankAccounts[0];
  const maxSteps = Math.floor(withdrawableMinor / stepMinor);

  const [bankAccountId, setBankAccountId] = useState<string | null>(null);

  const { control, getValues } = useForm<{ steps: number }>({
    defaultValues: { steps: maxSteps },
  });

  const { requestWithdrawal, isPending } = useRequestWithdrawal({
    onSuccess: () => onOpenChange(false),
  });

  const onSubmit = () =>
    requestWithdrawal({
      amount: toMajorUnits(getValues("steps") * stepMinor),
      bankAccountId: bankAccountId ?? defaultAccount?.id,
    });

  return (
    <AppDialog
      isOpen={open}
      onOpenChange={onOpenChange}
      title="Withdraw funds"
      description="Our team transfers the money to your bank account and we'll notify you once it's sent."
      width="480px"
      isSubmitting={isPending}
      primaryAction={
        bankAccounts.length
          ? {
              label: "Request withdrawal",
              onClick: onSubmit,
              isLoading: isPending,
            }
          : undefined
      }
    >
      {!bankAccounts.length ? (
        <EmptyState
          size="compact"
          icon={Landmark}
          title="Add a bank account first"
          description="Tell us which account your withdrawals should land in."
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
                {formatMoney(withdrawableMinor, currency)}
              </AppText>
            </div>
          </div>

          {maxSteps > 1 && (
            <FormNumberStepper
              control={control}
              name="steps"
              label={`Amount, in multiples of ${formatMoney(stepMinor, currency)}`}
              min={1}
              max={maxSteps}
              format={(steps) => formatMoney(steps * stepMinor, currency)}
            />
          )}

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
