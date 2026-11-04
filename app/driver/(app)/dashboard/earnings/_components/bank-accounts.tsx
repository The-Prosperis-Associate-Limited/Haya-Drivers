"use client";

import { FormInput } from "@/components/form/form-input";
import { FormSelect } from "@/components/form/form-select";
import { AppText } from "@/components/shared/app-text";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  bankAccountSchema,
  type BankAccountFormValues,
} from "@/schemas/earnings/bank-account";
import type { BankAccount } from "@/types/earnings";
import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, Check, Landmark, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  useAddBankAccount,
  useBankAccounts,
  useBanks,
  useRemoveBankAccount,
} from "../_hooks/use-earnings";

const EMPTY_FORM: BankAccountFormValues = {
  bank_code: "",
  account_number: "",
  account_name: "",
};

export const BankAccounts = function () {
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<BankAccount | null>(null);

  const { bankAccounts, isFetching } = useBankAccounts();
  const { banks } = useBanks({ shouldFetch: adding });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: EMPTY_FORM,
  });

  const closeForm = () => {
    setAdding(false);
    reset(EMPTY_FORM);
  };

  const { addBankAccount, isPending } = useAddBankAccount({
    onSuccess: closeForm,
  });

  const { removeBankAccount, isRemoving } = useRemoveBankAccount({
    onSuccess: () => setRemoving(null),
  });

  return (
    <div className="space-y-4">
      <div>
        {isFetching && !bankAccounts.length ? (
          <Skeleton className="h-14 w-full rounded-xl" />
        ) : !bankAccounts.length ? (
          <EmptyState
            size="compact"
            icon={Banknote}
            title="No payout account yet"
            description="Add the account your withdrawals should land in."
          />
        ) : (
          <div className="divide-border divide-y">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="bg-brand-soft text-brand grid size-10 shrink-0 place-items-center rounded-xl">
                    <Landmark className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <AppText type="label" className="block truncate">
                      {account.account_name}
                    </AppText>
                    <AppText
                      type="caption"
                      className="text-muted-foreground block truncate"
                    >
                      {account.bank_name}
                    </AppText>
                    <AppText
                      type="caption"
                      className="text-muted-foreground block"
                    >
                      {account.account_number}
                    </AppText>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {account.is_default && (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <Check className="h-3.5 w-3.5" />
                      Default
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label={`Remove ${account.bank_name} account`}
                    onClick={() => setRemoving(account)}
                    className="text-muted-foreground hover:text-destructive grid size-8 place-items-center rounded-lg transition-colors hover:bg-slate-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {adding ? (
        <form
          onSubmit={handleSubmit((values) => addBankAccount(values))}
          className="border-border space-y-4 border-t pt-4"
        >
          <AppText type="label" className="block text-sm font-semibold">
            Add a bank account
          </AppText>
          <FormSelect
            control={control}
            name="bank_code"
            errors={errors}
            label="Bank"
            placeholder="Select your bank"
            options={banks.map((bank) => ({
              value: bank.code,
              label: bank.name,
            }))}
          />

          <FormInput
            control={control}
            name="account_number"
            errors={errors}
            label="Account number"
            placeholder="0123456789"
            inputMode="numeric"
            maxLength={10}
          />

          <FormInput
            control={control}
            name="account_name"
            errors={errors}
            label="Account name"
            placeholder="The name your bank has on this account"
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeForm}
              className="h-10 rounded-xl px-5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isPending}
              className="h-10 rounded-xl px-5"
            >
              Save account
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          onClick={() => setAdding(true)}
          className="text-brand border-brand/40 h-10 w-full rounded-xl px-5"
        >
          <Plus className="size-4" />
          Add a bank account
        </Button>
      )}

      <ConfirmDialog
        isOpen={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="Remove this bank account?"
        description={
          removing
            ? `${removing.bank_name} · ${removing.account_number} will no longer be available for withdrawals.`
            : ""
        }
        confirmLabel="Remove account"
        isLoading={isRemoving}
        onConfirm={() => removing && removeBankAccount({ id: removing.id })}
      />
    </div>
  );
};
