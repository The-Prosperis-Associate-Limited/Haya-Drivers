"use client";

import { FormTextarea } from "@/components/form/form-textarea";
import { SalaryPayments } from "@/components/salary/salary-payments";
import { AppDialog } from "@/components/shared/app-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatMoney } from "@/lib/utils";
import {
  disputeSalarySchema,
  type DisputeSalaryFormValues,
} from "@/schemas/salary/dispute-salary";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useJobSalary } from "../_hooks/use-job-requests";
import type { SalaryPayment } from "@/types/salary";

interface Props {
  reference: string;
  clientName: string;
}

export const JobSalary = function ({ reference, clientName }: Props) {
  const [confirming, setConfirming] = useState<SalaryPayment | null>(null);
  const [disputing, setDisputing] = useState<SalaryPayment | null>(null);

  const { schedule, isFetching } = useJobSalary(reference);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DisputeSalaryFormValues>({
    resolver: zodResolver(disputeSalarySchema),
    defaultValues: { reason: "" },
  });

  const closeDispute = () => {
    setDisputing(null);
    reset();
  };

  const { mutate: confirm, isPending: isConfirming } = useSubmitData({
    url: () =>
      API_ENDPOINTS.jobRequests.confirmSalary(reference, confirming?.id ?? ""),
    onSuccessMessage: "Payment confirmed",
    onSuccess: () => setConfirming(null),
  });

  const { mutate: dispute, isPending: isDisputing } =
    useSubmitData<DisputeSalaryFormValues>({
      url: () =>
        API_ENDPOINTS.jobRequests.disputeSalary(reference, disputing?.id ?? ""),
      onSuccessMessage: "Reported - our team will look into it",
      onSuccess: closeDispute,
    });

  return (
    <>
      <SalaryPayments
        schedule={schedule}
        isFetching={isFetching}
        viewer="driver"
        intro={`${clientName} pays you directly - nothing is deducted. Confirm each payment when it lands in your account; only confirmed payments count as earnings.`}
        renderActions={(payment) => (
          <>
            {(payment.status === "PAID" ||
              (payment.status === "DUE" && payment.overdue)) && (
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-lg px-4 text-xs"
                onClick={() => setDisputing(payment)}
              >
                {payment.status === "PAID" ? "I wasn't paid" : "Report unpaid"}
              </Button>
            )}
            {(payment.status === "PAID" || payment.status === "DUE") && (
              <Button
                size="sm"
                variant={payment.status === "PAID" ? "default" : "ghost"}
                className="h-9 rounded-lg px-4 text-xs"
                onClick={() => setConfirming(payment)}
              >
                I've been paid
              </Button>
            )}
          </>
        )}
      />

      <ConfirmDialog
        isOpen={!!confirming}
        onOpenChange={(open) => !open && setConfirming(null)}
        icon={BadgeCheck}
        iconClassName="text-emerald-600"
        title="Confirm you received this salary?"
        description={
          confirming
            ? `${formatMoney(confirming.amount_minor, confirming.currency)} for ${confirming.period_label}. Only confirm once the money is in your account - this can't be undone.`
            : undefined
        }
        confirmLabel="Yes, I've been paid"
        onConfirm={() => confirm(undefined)}
        isLoading={isConfirming}
      />

      <AppDialog
        isOpen={!!disputing}
        onOpenChange={(open) => !open && closeDispute()}
        title={
          disputing?.status === "PAID"
            ? "Report a payment you didn't receive"
            : "Report an unpaid salary"
        }
        description={
          disputing
            ? `${formatMoney(disputing.amount_minor, disputing.currency)} for ${disputing.period_label}. Our team checks with ${clientName} and tells you both the outcome.`
            : undefined
        }
        width="480px"
        isSubmitting={isDisputing}
      >
        <form
          onSubmit={handleSubmit((values) => dispute(values))}
          className="space-y-4"
        >
          <FormTextarea
            control={control}
            name="reason"
            errors={errors}
            label="What happened?"
            placeholder="E.g. Nothing has arrived in my account since the 28th."
            rows={4}
          />
          <Button
            type="submit"
            isLoading={isDisputing}
            className="h-11 w-full rounded-xl text-sm"
          >
            Send to our team
          </Button>
        </form>
      </AppDialog>
    </>
  );
};
