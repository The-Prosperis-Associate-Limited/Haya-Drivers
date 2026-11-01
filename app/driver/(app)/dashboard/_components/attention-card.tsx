"use client";

import { AppText } from "@/components/shared/app-text";
import { StatusBadge } from "@/components/shared/status-badge";
import { useVerificationStatus } from "@/hooks/use-verification-status";
import Link from "next/link";
import type { DriverVerificationStatus } from "@/types/driver";

interface Props {
  status: DriverVerificationStatus;
}

export const AttentionCard = function ({ status }: Props) {
  const { verification } = useVerificationStatus(status === "REJECTED");

  if (status !== "REJECTED") return null;

  const documents = verification?.rejected_documents ?? [];

  if (!documents.length) return null;

  return (
    <div className="border-border space-y-5 rounded-xl border bg-white p-5 md:p-6">
      <AppText
        type="caption"
        className="text-foreground block font-semibold tracking-wide uppercase"
      >
        Need your attention
      </AppText>

      {documents.map((document) => (
        <div key={document.id} className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <AppText type="h4" className="text-lg font-semibold">
              {document.label}
            </AppText>
            <StatusBadge
              label="Action needed"
              className="shrink-0 border-red-200 bg-red-50 text-red-700"
            />
          </div>

          {document.reason && (
            <AppText type="caption" className="text-muted-foreground block">
              {document.reason}
            </AppText>
          )}
        </div>
      ))}

      <Link
        href="/driver/onboarding/documents"
        className="text-brand inline-block text-sm font-semibold underline underline-offset-2"
      >
        Open verification centre
      </Link>
    </div>
  );
};
