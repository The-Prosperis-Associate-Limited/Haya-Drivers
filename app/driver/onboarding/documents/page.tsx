"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteDocument,
  useGetDocuments,
  useUploadDocument,
} from "@/hooks/use-documents";
import { useOnboardingProfile } from "@/hooks/use-onboarding-profile";
import {
  DOCUMENT_LABELS,
  ONBOARDING_TIPS,
  formatDate,
  REQUIRED_DOCUMENTS,
  WORD_MIME_TYPES,
} from "@/lib/utils";
import type { DocumentType, DriverDocument } from "@/types/driver";
import { CircleAlert, Lock, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  PORTRAIT_DOCUMENTS,
  checkDocumentImage,
  type ImageCheckResult,
} from "@/lib/image-quality/check-document-image";
import { getFaceDetector } from "@/lib/image-quality/face";
import { DocumentRow } from "../_components/document-row";
import { StepHeader } from "../_components/step-header";
import { StepNote, StepPanel } from "../_components/step-panel";

const YOUR_DOCUMENTS: DocumentType[] = [
  "NIN_SLIP",
  "PASSPORT_PHOTO",
  "DRIVERS_LICENCE",
  "PROOF_OF_ADDRESS",
];

const GUARANTOR_DOCUMENTS: DocumentType[] = [
  "GUARANTOR_PASSPORT",
  "GUARANTOR_NIN_SLIP",
];

const UPLOAD_ANYWAY_AFTER = 3;

interface QualityIssue {
  reason: string;
  attempts: number;
  file: File;
}

const CV_ACCEPT = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  ...WORD_MIME_TYPES,
].join(",");

const HINTS: Partial<Record<DocumentType, string>> = {
  NIN_SLIP: "The whole slip, all four corners in the photo",
  PASSPORT_PHOTO: "A recent photo of your face on a plain background",
  DRIVERS_LICENCE: "Front of the card, sharp enough to read the number",
  PROOF_OF_ADDRESS: "Utility bill or tenancy agreement from the last 3 months",
  GUARANTOR_PASSPORT: "Your guarantor's recent passport photo",
  GUARANTOR_NIN_SLIP: "Your guarantor's NIN slip",
  CV: "PDF or Word, with your driving jobs and the dates you held them",
};

export default function DocumentsStep() {
  const router = useRouter();
  const { profile } = useOnboardingProfile();
  const { documents, isFetching, dueAt } = useGetDocuments();

  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<DriverDocument | null>(
    null,
  );

  const { uploadDocument } = useUploadDocument({
    onSuccess: () => setUploadingType(null),
  });
  const { deleteDocument, isPending: isDeleting } = useDeleteDocument();

  const [checkingType, setCheckingType] = useState<DocumentType | null>(null);
  const [issues, setIssues] = useState<
    Partial<Record<DocumentType, QualityIssue>>
  >({});

  const send = (type: DocumentType, file: File) => {
    setIssues(({ [type]: _cleared, ...rest }) => rest);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    setUploadingType(type);
    uploadDocument(formData, { onError: () => setUploadingType(null) });
  };

  const handleUpload = async (type: DocumentType, file: File) => {
    setCheckingType(type);
    const result = await checkDocumentImage(type, file).catch(
      (): ImageCheckResult => ({ ok: true }),
    );
    setCheckingType(null);

    if (result.ok) return send(type, file);

    setIssues((current) => ({
      ...current,
      [type]: {
        reason: result.reason,
        attempts: (current[type]?.attempts ?? 0) + 1,
        file,
      },
    }));
  };

  const portraitOutstanding = PORTRAIT_DOCUMENTS.some(
    (type) =>
      !documents.some(
        (document) => document.type === type && document.status !== "REJECTED",
      ),
  );

  useEffect(() => {
    if (portraitOutstanding) getFaceDetector().catch(() => undefined);
  }, [portraitOutstanding]);

  const documentFor = (type: DocumentType) =>
    documents.find((document) => document.type === type);

  const requiredDone = REQUIRED_DOCUMENTS.filter(
    (type) => !!documentFor(type),
  ).length;
  const rejected = documents.filter(
    (document) => document.status === "REJECTED",
  );
  const resubmitting = profile?.verification_status === "REJECTED";
  const fillingGap =
    profile?.verification_status === "APPROVED" &&
    requiredDone < REQUIRED_DOCUMENTS.length;

  const row = (type: DocumentType) => {
    const document = documentFor(type);
    return (
      <DocumentRow
        key={type}
        type={type}
        label={DOCUMENT_LABELS[type]}
        hint={HINTS[type]}
        accept={type === "CV" ? CV_ACCEPT : undefined}
        required
        status={document?.status}
        fileName={document?.file_name}
        rejectionReason={document?.rejection_reason}
        isUploading={uploadingType === type}
        isChecking={checkingType === type}
        qualityIssue={issues[type]?.reason}
        onUpload={(file) => handleUpload(type, file)}
        onUploadAnyway={
          (issues[type]?.attempts ?? 0) >= UPLOAD_ANYWAY_AFTER
            ? () => send(type, issues[type]!.file)
            : undefined
        }
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
        disabled:
          requiredDone < REQUIRED_DOCUMENTS.length ||
          !!rejected.length ||
          !!uploadingType ||
          !!checkingType,
        hint: rejected.length
          ? `${rejected.length} document${rejected.length === 1 ? "" : "s"} to replace`
          : requiredDone < REQUIRED_DOCUMENTS.length
            ? `${REQUIRED_DOCUMENTS.length - requiredDone} required document${REQUIRED_DOCUMENTS.length - requiredDone === 1 ? "" : "s"} left`
            : "All required documents uploaded",
      }}
    >
      <StepHeader
        step="DOCUMENTS"
        title={
          resubmitting
            ? "Replace the documents we couldn't verify"
            : "Upload your documents"
        }
        description={`Clear photos taken in good light, nothing cropped or blurry. All ${REQUIRED_DOCUMENTS.length} are required before you can submit for review.`}
      />

      {fillingGap && (
        <div className="mb-3.5">
          <StepNote icon={CircleAlert} tone="amber">
            You&apos;re verified, and you stay verified while our team checks
            the new upload
            {dueAt ? ` - just upload it before ${formatDate(dueAt)}` : ""}. Your
            other documents are untouched.
          </StepNote>
        </div>
      )}

      {resubmitting && !!rejected.length && (
        <div className="mb-3.5">
          <StepNote icon={CircleAlert} tone="red">
            {rejected.length === 1
              ? "One document needs replacing"
              : `${rejected.length} documents need replacing`}{" "}
            - the reviewer&apos;s reason is under each one. Everything else is
            kept.
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
            title="Your documents"
            description={`${requiredDone} of ${REQUIRED_DOCUMENTS.length} uploaded`}
            aside={
              <Progress
                value={(requiredDone / REQUIRED_DOCUMENTS.length) * 100}
                className="h-1.5 w-24"
              />
            }
          >
            <div className="space-y-2.5">{YOUR_DOCUMENTS.map(row)}</div>
          </StepPanel>

          <StepPanel
            title="Your CV"
            description="Your work history, for our verification team"
          >
            <div className="space-y-2.5">{row("CV")}</div>
          </StepPanel>

          <StepPanel
            title="Your guarantor"
            description="Ask them for these before you start"
          >
            <div className="space-y-2.5">{GUARANTOR_DOCUMENTS.map(row)}</div>
          </StepPanel>

          <StepNote icon={Lock}>
            Documents are only seen by our verification team - never by clients.
            Clients see a &quot;Verified&quot; badge once we&apos;ve checked
            them.
          </StepNote>
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
