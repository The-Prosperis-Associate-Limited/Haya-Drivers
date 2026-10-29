"use client";

import { FormTextarea } from "@/components/form/form-textarea";
import { AppDialog } from "@/components/shared/app-dialog";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatWorkDate } from "@/lib/utils";
import {
  resolveFlagSchema,
  type ResolveFlagFormValues,
} from "@/schemas/admin/resolve-flag";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { AttendanceFlag, FlagResolution } from "@/types/attendance";

interface Props {
  flag: AttendanceFlag | null;
  outcome: FlagResolution;
  onClose: () => void;
  listUrl: string;
}

const COPY: Record<
  FlagResolution,
  { title: string; description: string; cta: string }
> = {
  UPHELD: {
    title: "Uphold this flag?",
    description:
      "The client was right. The day counts against the driver's on-time rate, and both sides are told.",
    cta: "Uphold flag",
  },
  DISMISSED: {
    title: "Dismiss this flag?",
    description:
      "The check-in stands and nothing changes on the driver's record. Both sides are told.",
    cta: "Dismiss flag",
  },
};

export const ResolveFlagDialog = function ({
  flag,
  outcome,
  onClose,
  listUrl,
}: Props) {
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

  const { mutate, isPending } = useSubmitData<ResolveFlagFormValues>({
    url: () => API_ENDPOINTS.adminAttendance.resolve(flag?.id ?? ""),
    getBody: ({ note }) => ({ note, outcome }),
    onSuccessMessage: outcome === "UPHELD" ? "Flag upheld" : "Flag dismissed",
    additionalQueryKeys: [[listUrl]],
    onSuccess: close,
  });

  const copy = COPY[outcome];

  return (
    <AppDialog
      isOpen={!!flag}
      onOpenChange={(open) => !open && close()}
      title={copy.title}
      description={
        flag
          ? `${flag.driver?.name ?? "Driver"} for ${flag.client.name}, ${formatWorkDate(flag.work_date)}. ${copy.description}`
          : undefined
      }
      width="480px"
      isSubmitting={isPending}
    >
      <form
        onSubmit={handleSubmit((values) => mutate(values))}
        className="space-y-4"
      >
        <FormTextarea
          control={control}
          name="note"
          errors={errors}
          label="Note to the client and driver"
          placeholder={
            outcome === "UPHELD"
              ? "E.g. The driver confirmed they arrived at 10am."
              : "E.g. The driver's location history shows them on site at 8am."
          }
          rows={4}
        />
        <Button
          type="submit"
          variant={outcome === "UPHELD" ? "destructive" : "default"}
          isLoading={isPending}
          className="h-11 w-full rounded-xl text-sm"
        >
          {copy.cta}
        </Button>
      </form>
    </AppDialog>
  );
};
