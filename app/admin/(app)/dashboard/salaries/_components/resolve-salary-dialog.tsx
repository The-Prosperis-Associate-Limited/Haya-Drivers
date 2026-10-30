"use client";

import { FormTextarea } from "@/components/form/form-textarea";
import { AppDialog } from "@/components/shared/app-dialog";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatMoney } from "@/lib/utils";
import {
  resolveFlagSchema,
  type ResolveFlagFormValues,
} from "@/schemas/admin/resolve-flag";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type {
  SalaryPaymentWithParties,
  SalaryResolution,
} from "@/types/salary";

interface Props {
  payment: SalaryPaymentWithParties | null;
  onClose: () => void;
}

export const ResolveSalaryDialog = function ({ payment, onClose }: Props) {
  const [outcome, setOutcome] = useState<SalaryResolution>("UNPAID");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResolveFlagFormValues>({
    resolver: zodResolver(resolveFlagSchema),
    defaultValues: { note: "" },
  });

  const close = () => {
    reset();
    onClose();
  };

  const { mutate, isPending } = useSubmitData<
    ResolveFlagFormValues & { outcome: SalaryResolution }
  >({
    url: () => API_ENDPOINTS.adminSalaries.resolve(payment?.id ?? ""),
    onSuccessMessage:
      outcome === "PAID" ? "Recorded as paid" : "Salary reopened as due",
    onSuccess: close,
  });

  const submit = (next: SalaryResolution) => {
    setOutcome(next);
    handleSubmit((values) => mutate({ ...values, outcome: next }))();
  };

  return (
    <AppDialog
      isOpen={!!payment}
      onOpenChange={(open) => !open && close()}
      title="Resolve salary dispute"
      description={
        payment
          ? `${payment.driver?.name ?? "The driver"} says ${payment.client.name} hasn't paid ${formatMoney(payment.amount_minor, payment.currency)} for ${payment.period_label}. Check with both sides, then record what you found - they both see your note.`
          : undefined
      }
      width="520px"
      isSubmitting={isPending}
    >
      <form onSubmit={(event) => event.preventDefault()} className="space-y-4">
        {payment?.dispute_reason && (
          <p className="text-muted-foreground rounded-xl bg-slate-50 p-3 text-xs">
            Driver: &ldquo;{payment.dispute_reason}&rdquo;
            {payment.client_note && (
              <>
                <br />
                Client: &ldquo;{payment.client_note}&rdquo;
              </>
            )}
            {payment.receipt_url && (
              <>
                <br />
                <a
                  href={payment.receipt_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand font-medium hover:underline"
                >
                  Open the client&apos;s receipt
                </a>
              </>
            )}
          </p>
        )}

        <FormTextarea
          control={control}
          name="note"
          errors={errors}
          label="Note to the client and driver"
          placeholder="E.g. The client's bank confirmed the transfer on the 28th."
          rows={4}
        />

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            isLoading={isPending && outcome === "PAID"}
            disabled={isPending}
            className="h-11 rounded-xl text-sm"
            onClick={() => submit("PAID")}
          >
            It was paid
          </Button>
          <Button
            type="button"
            variant="destructive"
            isLoading={isPending && outcome === "UNPAID"}
            disabled={isPending}
            className="h-11 rounded-xl text-sm"
            onClick={() => submit("UNPAID")}
          >
            Still unpaid
          </Button>
        </div>
      </form>
    </AppDialog>
  );
};
