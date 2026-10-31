"use client";

import { SalaryPayments } from "@/components/salary/salary-payments";
import { AppDialog } from "@/components/shared/app-dialog";
import { AppDropzone } from "@/components/shared/app-dropzone";
import { AppTextArea } from "@/components/shared/app-textarea";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatMoney } from "@/lib/utils";
import { useState } from "react";
import { useHireSalary } from "../_hooks/use-hires";
import type { SalaryPayment } from "@/types/salary";

interface Props {
  reference: string;
  driverName: string;
}

export const HireSalary = function ({ reference, driverName }: Props) {
  const [paying, setPaying] = useState<SalaryPayment | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [note, setNote] = useState("");

  const { schedule, isFetching } = useHireSalary(reference);

  const close = () => {
    setPaying(null);
    setReceipt(null);
    setNote("");
  };

  const { mutate, isPending } = useSubmitData<FormData>({
    url: () => API_ENDPOINTS.hires.markSalaryPaid(reference, paying?.id ?? ""),
    onSuccessMessage: `Marked as paid - we've asked ${driverName} to confirm`,
    onSuccess: close,
  });

  const submit = () => {
    const body = new FormData();
    if (receipt) body.append("receipt", receipt);
    if (note.trim()) body.append("note", note.trim());
    mutate(body);
  };

  return (
    <>
      <SalaryPayments
        schedule={schedule}
        isFetching={isFetching}
        viewer="client"
        intro={`You pay ${driverName} directly - it never passes through Haya Drivers. Mark each period as paid once the money has gone, and ${driverName} confirms they received it.`}
        renderActions={(payment) =>
          payment.status === "DUE" && (
            <Button
              size="sm"
              variant={payment.overdue ? "default" : "outline"}
              className="h-9 rounded-lg px-4 text-xs"
              onClick={() => setPaying(payment)}
            >
              Mark as paid
            </Button>
          )
        }
      />

      <AppDialog
        isOpen={!!paying}
        onOpenChange={(open) => !open && close()}
        title="Mark this salary as paid"
        description={
          paying
            ? `${formatMoney(paying.amount_minor, paying.currency)} to ${driverName} for ${paying.period_label}. We'll ask ${driverName} to confirm they received it.`
            : undefined
        }
        width="480px"
        isSubmitting={isPending}
      >
        <div className="space-y-4">
          <AppDropzone
            label="Transfer receipt (optional)"
            hint="JPG, PNG or PDF, up to 5MB - it settles any question later"
            accept={{
              "image/jpeg": [],
              "image/png": [],
              "application/pdf": [],
            }}
            maxSize={5 * 1024 * 1024}
            value={receipt}
            onChange={(file) => setReceipt(file as File | null)}
          />
          <AppTextArea
            label="Note (optional)"
            placeholder="E.g. Sent from our GTBank account on the 28th"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
          />
          <Button
            isLoading={isPending}
            onClick={submit}
            className="h-11 w-full rounded-xl text-sm"
          >
            Mark as paid
          </Button>
        </div>
      </AppDialog>
    </>
  );
};
