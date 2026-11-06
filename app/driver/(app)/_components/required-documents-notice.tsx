"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { Button } from "@/components/ui/button";
import { useGetDocuments } from "@/hooks/use-documents";
import { DOCUMENT_LABELS, REQUIRED_DOCUMENTS, formatDate } from "@/lib/utils";
import type { DocumentType, DriverVerificationStatus } from "@/types/driver";
import { FileWarning } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PROMPT_KEY = "haya-required-documents-prompt";

const promptShownThisSession = () => {
  try {
    return sessionStorage.getItem(PROMPT_KEY) === "1";
  } catch {
    return false;
  }
};

const rememberPromptShown = () => {
  try {
    sessionStorage.setItem(PROMPT_KEY, "1");
  } catch {}
};

interface Props {
  status?: DriverVerificationStatus;
}

export const RequiredDocumentsNotice = function ({ status }: Props) {
  const router = useRouter();
  const { documents, missing, dueAt } = useGetDocuments();
  const [dismissed, setDismissed] = useState(promptShownThisSession);

  const outstanding: DocumentType[] = [
    ...missing.map((document) => document.type),
    ...documents
      .filter(
        (document) =>
          document.status === "REJECTED" &&
          REQUIRED_DOCUMENTS.includes(document.type),
      )
      .map((document) => document.type),
  ];

  const startedVerification =
    (!!status && status !== "UNSUBMITTED") || documents.length > 0;

  if (!startedVerification || !outstanding.length) return null;

  const it = outstanding.length === 1 ? "it" : "them";

  const message =
    status === "APPROVED" && dueAt
      ? `Upload ${it} by ${formatDate(dueAt)} to keep your verified badge and stay visible to clients.`
      : status === "APPROVED"
        ? `Upload ${it} to keep your verified badge.`
        : status === "PENDING"
          ? `Your application can't be approved until ${outstanding.length === 1 ? "it's" : "they're"} uploaded.`
          : `Upload ${it} to finish your application.`;

  const title =
    outstanding.length === 1
      ? "A required document is missing"
      : `${outstanding.length} required documents are missing`;

  const closePrompt = () => {
    rememberPromptShown();
    setDismissed(true);
  };

  const chips = (
    <div className="flex flex-wrap gap-1.5">
      {outstanding.map((type) => (
        <span
          key={type}
          className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800"
        >
          {DOCUMENT_LABELS[type] ?? type}
        </span>
      ))}
    </div>
  );

  return (
    <>
      <div
        role="status"
        className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center md:mb-6 print:hidden"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
          <FileWarning className="size-5" />
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-[14px] font-semibold text-amber-900">{title}</p>
          <p className="text-[13px] text-amber-800">{message}</p>
          {chips}
        </div>
        <Button asChild className="h-10 shrink-0 rounded-xl">
          <Link href="/driver/onboarding/documents">Upload now</Link>
        </Button>
      </div>

      <AppDialog
        isOpen={!dismissed}
        onOpenChange={(open) => !open && closePrompt()}
        title={title}
        description={message}
        width="440px"
        cancelLabel="Later"
        primaryAction={{
          label: "Upload now",
          onClick: () => {
            closePrompt();
            router.push("/driver/onboarding/documents");
          },
        }}
      >
        <div className="space-y-3">
          {chips}
          <p className="text-muted-foreground text-[13px]">
            Every driver now needs these on file alongside their other
            documents. It takes a minute from your phone.
          </p>
        </div>
      </AppDialog>
    </>
  );
};
