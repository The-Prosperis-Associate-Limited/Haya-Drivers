"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteDocument, useGetDocuments, useUploadDocument } from "@/hooks/use-documents";
import { useOnboardingProfile } from "@/hooks/use-onboarding-profile";
import { DOCUMENT_LABELS, ONBOARDING_TIPS } from "@/lib/utils";
import type { DocumentType, DriverDocument } from "@/types/driver";
import { CircleAlert, Lock, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DocumentRow } from "../_components/document-row";
import { StepHeader } from "../_components/step-header";
import { StepNote, StepPanel } from "../_components/step-panel";

// The three the review screen refuses to submit without. Proof of address and
// the guarantor files are collected but do not block a first submission.
const REQUIRED_DOCUMENTS: DocumentType[] = ["NIN_SLIP", "PASSPORT_PHOTO", "DRIVERS_LICENCE"];

const OPTIONAL_DOCUMENTS: DocumentType[] = ["PROOF_OF_ADDRESS", "GUARANTOR_PASSPORT", "GUARANTOR_NIN_SLIP"];

const HINTS: Partial<Record<DocumentType, string>> = {
  NIN_SLIP: "The whole slip, all four corners in the photo",
  PASSPORT_PHOTO: "A recent photo of your face on a plain background",
  DRIVERS_LICENCE: "Front of the card, sharp enough to read the number",
  PROOF_OF_ADDRESS: "Utility bill or tenancy agreement from the last 3 months",
  GUARANTOR_PASSPORT: "Your guarantor's recent passport photo",
  GUARANTOR_NIN_SLIP: "Your guarantor's NIN slip",
};

export default function DocumentsStep() {
  const router = useRouter();
  const { profile } = useOnboardingProfile();
  const { documents, isFetching } = useGetDocuments();

  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<DriverDocument | null>(null);

  const { uploadDocument } = useUploadDocument({ onSuccess: () => setUploadingType(null) });
  const { deleteDocument, isPending: isDeleting } = useDeleteDocument();

  const handleUpload = (type: DocumentType, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    setUploadingType(type);
    uploadDocument(formData, { onError: () => setUploadingType(null) });
  };

  const documentFor = (type: DocumentType) => documents.find((document) => document.type === type);

  const requiredDone = REQUIRED_DOCUMENTS.filter((type) => !!documentFor(type)).length;
  const rejected = documents.filter((document) => document.status === "REJECTED");
  const resubmitting = profile?.verification_status === "REJECTED";

  const row = (type: DocumentType, required: boolean) => {
    const document = documentFor(type);
    return (
      <DocumentRow
        key={type}
        type={type}
        label={DOCUMENT_LABELS[type]}
        hint={HINTS[type]}
        required={required}
        status={document?.status}
        fileName={document?.file_name}
        rejectionReason={document?.rejection_reason}
        isUploading={uploadingType === type}
        onUpload={(file) => handleUpload(type, file)}
        onRemove={document ? () => setPendingRemoval(document) : undefined}
      />
    );
  };

  return (
    <OnboardingShell
      step="DOCUMENTS"
      tips={ONBOARDING_TIPS.DOCUMENTS}
      footer={{
        label: resubmitting ? "Review and resubmit" : "Continue",
        onClick: () => router.push("/driver/onboarding/review"),
        disabled: requiredDone < REQUIRED_DOCUMENTS.length || !!rejected.length || !!uploadingType,
        hint: rejected.length
          ? `${rejected.length} document${rejected.length === 1 ? "" : "s"} to replace`
          : requiredDone < REQUIRED_DOCUMENTS.length
            ? `${REQUIRED_DOCUMENTS.length - requiredDone} required document${REQUIRED_DOCUMENTS.length - requiredDone === 1 ? "" : "s"} left`
            : "All required documents uploaded",
      }}
    >
      <StepHeader
        step="DOCUMENTS"
        title={resubmitting ? "Replace the documents we couldn't verify" : "Upload your documents"}
        description="Clear photos taken in good light, nothing cropped or blurry. Three are required to submit; the rest speed up your review."
      />

      {resubmitting && !!rejected.length && (
        <div className="mb-3.5">
          <StepNote icon={CircleAlert} tone="red">
            {rejected.length === 1 ? "One document needs replacing" : `${rejected.length} documents need replacing`} - the reviewer&apos;s reason is under each one. Everything else is kept.
          </StepNote>
        </div>
      )}

      {isFetching && !documents.length ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-3.5">
          <StepPanel
            title="Required"
            description={`${requiredDone} of ${REQUIRED_DOCUMENTS.length} uploaded`}
            aside={<Progress value={(requiredDone / REQUIRED_DOCUMENTS.length) * 100} className="h-1.5 w-24" />}
          >
            <div className="space-y-2.5">{REQUIRED_DOCUMENTS.map((type) => row(type, true))}</div>
          </StepPanel>

          <StepPanel title="Recommended" description="Drivers with these get verified faster">
            <div className="space-y-2.5">{OPTIONAL_DOCUMENTS.map((type) => row(type, false))}</div>
          </StepPanel>

          <StepNote icon={Lock}>Documents are only seen by our verification team - never by clients. Clients see a &quot;Verified&quot; badge once we&apos;ve checked them.</StepNote>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!pendingRemoval}
        onOpenChange={(open) => !open && setPendingRemoval(null)}
        icon={Trash2}
        iconClassName="text-destructive"
        title={`Remove ${pendingRemoval ? (DOCUMENT_LABELS[pendingRemoval.type] ?? "this document") : "this document"}?`}
        description="The file is deleted from your application. You can upload a replacement afterwards."
        confirmLabel="Remove"
        confirmVariant="destructive"
        isLoading={isDeleting}
        onConfirm={() => {
          if (pendingRemoval) deleteDocument({ id: pendingRemoval.id });
          setPendingRemoval(null);
        }}
      />
    </OnboardingShell>
  );
}
