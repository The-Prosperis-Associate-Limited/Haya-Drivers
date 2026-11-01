"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { AppText } from "@/components/shared/app-text";
import { TriangleAlert } from "lucide-react";

export interface PreviewRow {
  label: string;
  value: string;
}

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rows: PreviewRow[];
  onConfirm: () => void;
  isSubmitting?: boolean;
  confirmLabel?: string;
}

// The last stop before a request reaches our team - requests have no edit
// flow, so this is the user's one chance to catch a mistake.
export const RequestPreviewDialog = function ({
  isOpen,
  onOpenChange,
  rows,
  onConfirm,
  isSubmitting,
  confirmLabel = "Confirm & submit",
}: Props) {
  return (
    <AppDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isSubmitting={isSubmitting}
      title="Review your request"
      description="Make sure everything is correct before you submit."
      width="480px"
      cancelLabel="Go back"
      primaryAction={{
        label: confirmLabel,
        onClick: onConfirm,
        isLoading: isSubmitting,
      }}
    >
      <div className="space-y-4">
        <dl className="border-border divide-border divide-y rounded-xl border">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-start justify-between gap-4 px-4 py-2.5"
            >
              <dt className="text-muted-foreground shrink-0 text-xs font-medium">
                {row.label}
              </dt>
              <dd className="text-right text-xs font-semibold wrap-break-word">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 px-4 py-3">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <AppText type="caption" className="block text-xs text-amber-700">
            A request cannot be edited after it is submitted. If anything above
            is wrong, go back and fix it now.
          </AppText>
        </div>
      </div>
    </AppDialog>
  );
};
