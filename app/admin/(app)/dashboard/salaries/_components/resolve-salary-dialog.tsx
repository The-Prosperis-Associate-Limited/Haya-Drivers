"use client";

import { FormTextarea } from "@/components/form/form-textarea";
import { AppDialog, DIALOG_BUTTON } from "@/components/shared/app-dialog";
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
      dialogFooter={
        <>
          <Button
            type="button"
            variant="outline"
            isLoading={isPending && outcome === "PAID"}
            disabled={isPending}
            className={DIALOG_BUTTON}
            onClick={() => submit("PAID")}
          >
            It was paid
          </Button>
          <Button
            type="button"
            variant="destructive"
            isLoading={isPending && outcome === "UNPAID"}
            disabled={isPending}
            className={DIALOG_BUTTON}
            onClick={() => submit("UNPAID")}
          >
            Still unpaid
          </Button>
        </>
      }
    >
      <form onSubmit={(event) => event.preventDefault()} className="space-y-4">
        {payment?.dispute_reason && (
          <dl className="border-border divide-border divide-y rounded-xl border text-[13px]">
            <div className="space-y-0.5 px-3.5 py-2.5">
              <dt className="text-muted-foreground text-[11.5px] font-semibold tracking-wide uppercase">
                Driver says
              </dt>
              <dd>&ldquo;{payment.dispute_reason}&rdquo;</dd>
            </div>
            {payment.client_note && (
              <div className="space-y-0.5 px-3.5 py-2.5">
                <dt className="text-muted-foreground text-[11.5px] font-semibold tracking-wide uppercase">
                  Client&apos;s note
                </dt>
                <dd>&ldquo;{payment.client_note}&rdquo;</dd>
              </div>
            )}
            {payment.receipt_url && (
              <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <dt className="text-muted-foreground text-[11.5px] font-semibold tracking-wide uppercase">
                  Receipt
                </dt>
                <dd>
                  <a
                    href={payment.receipt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand font-medium hover:underline"
                  >
                    Open the client&apos;s receipt
                  </a>
                </dd>
              </div>
            )}
          </dl>
        )}

        <FormTextarea
          control={control}
          name="note"
          errors={errors}
          label="Note to the client and driver"
          placeholder="E.g. The client's bank confirmed the transfer on the 28th."
          rows={4}
        />
      </form>
    </AppDialog>
  );
};
