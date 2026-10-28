"use client";

import { AppInput } from "@/components/shared/app-input";
import { AppSelect } from "@/components/shared/app-select";
import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { showToast } from "@/lib/show-toast";
import { Banknote, Check } from "lucide-react";
import { useState } from "react";
import {
  useAddBankAccount,
  useBankAccounts,
  useBanks,
} from "../_hooks/use-earnings";

export const BankAccounts = function () {
  const [adding, setAdding] = useState(false);
  const [bankCode, setBankCode] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const { bankAccounts, isFetching } = useBankAccounts();
  const { banks } = useBanks({
    country: "nigeria",
    currency: "NGN",
    shouldFetch: adding,
  });

  const { addBankAccount, isPending } = useAddBankAccount({
    onSuccess: () => {
      setAdding(false);
      setBankCode(null);
      setAccountNumber("");
      setAccountName("");
    },
  });

  const onSubmit = () => {
    const bank = banks.find((option) => option.code === bankCode);

    if (!bank) return showToast("error", "Select your bank");
    if (!/^\d{8,20}$/.test(accountNumber)) {
      return showToast("error", "Enter a valid account number");
    }
    if (accountName.trim().length < 3) {
      return showToast("error", "Enter the name on the account");
    }

    addBankAccount({
      bank_code: bank.code,
      bank_name: bank.name,
      account_number: accountNumber,
      account_name: accountName.trim(),
      currency: bank.currency || "NGN",
    });
  };

  return (
    <div className="space-y-4">
      <div className="border-border overflow-hidden rounded-xl border bg-white">
        {isFetching && !bankAccounts.length ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        ) : !bankAccounts.length ? (
          <EmptyState
            icon={Banknote}
            title="No payout account yet."
            description="Add the account your withdrawals should land in."
          />
        ) : (
          <div className="divide-border divide-y">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between gap-3 p-4 md:p-5"
              >
                <div className="min-w-0">
                  <AppText type="label" className="block truncate">
                    {account.account_name}
                  </AppText>
                  <AppText
                    type="caption"
                    className="text-muted-foreground block truncate"
                  >
                    {account.bank_name} · {account.account_number}
                  </AppText>
                </div>

                {account.is_default && (
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <Check className="h-3.5 w-3.5" />
                    Default
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {adding ? (
        <div className="border-border space-y-4 rounded-xl border bg-white p-4 md:p-5">
          <AppSelect
            label="Bank"
            placeholder="Select your bank"
            options={banks.map((bank) => ({
              value: bank.code,
              label: bank.name,
            }))}
            value={bankCode}
            onValueChange={setBankCode}
          />

          <AppInput
            label="Account number"
            placeholder="0123456789"
            inputMode="numeric"
            value={accountNumber}
            onChange={(event) => setAccountNumber(event.target.value)}
          />

          <AppInput
            label="Account name"
            placeholder="The name on the account"
            value={accountName}
            onChange={(event) => setAccountName(event.target.value)}
          />

          <AppText type="caption" className="text-muted-foreground block">
            Make sure the name matches your bank records exactly - payments are
            sent to this account.
          </AppText>

          <div className="flex gap-3">
            <Button
              isLoading={isPending}
              onClick={onSubmit}
              className="h-11 rounded-lg px-6"
            >
              Save account
            </Button>
            <Button
              variant="outline"
              onClick={() => setAdding(false)}
              className="h-11 rounded-lg px-6"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setAdding(true)}
          className="text-brand border-brand/40 h-11 rounded-lg px-6"
        >
          Add a bank account
        </Button>
      )}
    </div>
  );
};
