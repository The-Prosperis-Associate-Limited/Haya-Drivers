"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { AppText } from "@/components/shared/app-text";
import { AppTextArea } from "@/components/shared/app-textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { personName, statusBadgeClass, statusLabel } from "@/lib/admin";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { DOCUMENT_LABELS, formatDate } from "@/lib/utils";
import { Download, ExternalLink, Eye, FileText } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { APIResponse } from "@/types/response";
import type { AdminVerificationSubmission } from "@/types/admin";
import type { DriverDocument } from "@/types/driver";
import { DetailRow } from "../../../../_components/detail-card";

const REJECTION_REASONS = [
  "Image is blurry / unreadable",
  "Document is expired",
  "Wrong document type uploaded",
  "Information does not match profile",
  "Suspected forgery or tampering",
];

const isPdf = (document: DriverDocument) =>
  document.mime_type === "application/pdf" || /\.pdf($|\?)/i.test(document.url);

// Cloudinary stores "auto" PDFs as image resources, so swapping the extension renders page 1.
const pdfThumbnailUrl = (url: string) =>
  url.includes("/image/upload/") ? url.replace(/\.pdf($|\?)/i, ".jpg$1") : null;

interface Props {
  userId: string;
}

export const DriverDocuments = function ({ userId }: Props) {
  const submissionUrl = API_ENDPOINTS.adminVerifications.submission(userId);

  const { data } = useGetData<APIResponse<AdminVerificationSubmission>>({
    url: submissionUrl,
  });

  const submission = data?.data;
  const documents = submission?.documents ?? [];
  const verification = submission?.verification;
  const driverName = submission ? personName(submission.profile.user) : "";

  const [viewing, setViewing] = useState<DriverDocument | null>(null);
  const [rejecting, setRejecting] = useState<DriverDocument | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectSubmissionOpen, setRejectSubmissionOpen] = useState(false);
  const [submissionReason, setSubmissionReason] = useState("");

  const closeRejectForm = () => {
    setRejecting(null);
    setReasons([]);
    setNote("");
  };

  const { mutate: reviewDocument, isPending: isReviewingDocument } =
    useSubmitData<{
      documentId: string;
      status: "APPROVED" | "REJECTED";
      rejection_reason?: string;
    }>({
      url: ({ documentId }) =>
        API_ENDPOINTS.adminVerifications.reviewDocument(documentId),
      getBody: ({ status, rejection_reason }) => ({
        status,
        rejection_reason,
      }),
      method: "patch",
      onSuccessMessage: "Document reviewed",
      additionalQueryKeys: [[submissionUrl]],
      onSuccess: () => {
        setViewing(null);
        closeRejectForm();
      },
    });

  const { mutate: reviewSubmission, isPending: isReviewingSubmission } =
    useSubmitData<{
      status: "APPROVED" | "REJECTED";
      rejection_reason?: string;
    }>({
      url: API_ENDPOINTS.adminVerifications.reviewSubmission(userId),
      method: "patch",
      onSuccessMessage: "Verification reviewed",
      additionalQueryKeys: [[submissionUrl]],
      onSuccess: () => {
        setApproveOpen(false);
        setRejectSubmissionOpen(false);
        setSubmissionReason("");
      },
    });

  const rejectDocument = () => {
    if (!rejecting) return;

    // The picked reasons plus the free note become the one string the driver's
    // resubmission screen renders verbatim.
    const rejection_reason = [...reasons, note.trim()]
      .filter(Boolean)
      .join(". ");

    if (!rejection_reason) return;

    reviewDocument({
      documentId: rejecting.id,
      status: "REJECTED",
      rejection_reason,
    });
  };

  if (submission && !documents.length) {
    return (
      <EmptyState
        title="No documents yet"
        description="This driver has not uploaded any verification documents."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-border rounded-2xl border bg-white p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="divide-border grid flex-1 grid-cols-1 gap-x-10 sm:grid-cols-2">
            <DetailRow
              label="Submitted"
              value={
                verification?.submitted_at
                  ? formatDate(verification.submitted_at)
                  : "-"
              }
            />
            <DetailRow
              label="Reviewed"
              value={
                verification?.reviewed_at
                  ? formatDate(verification.reviewed_at)
                  : "Not yet reviewed"
              }
            />
          </div>

          <StatusBadge
            label={statusLabel(verification?.status ?? "UNSUBMITTED")}
            className={statusBadgeClass(verification?.status ?? "UNSUBMITTED")}
          />
        </div>

        {verification?.status === "PENDING" && (
          <div className="border-border mt-4 flex flex-wrap justify-end gap-3 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setRejectSubmissionOpen(true)}
              className="text-destructive border-red-200 hover:bg-red-50"
            >
              Reject Application
            </Button>
            <Button onClick={() => setApproveOpen(true)}>Approve Driver</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {documents.map((document) => {
          const thumbnail = isPdf(document)
            ? pdfThumbnailUrl(document.url)
            : document.url;

          return (
            <div
              key={document.id}
              className="border-border overflow-hidden rounded-xl border bg-white"
            >
              <div className="relative h-36 w-full bg-slate-50">
                {thumbnail ? (
                  <Image
                    src={thumbnail}
                    alt={DOCUMENT_LABELS[document.type] ?? document.type}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FileText className="text-muted-foreground h-10 w-10" />
                  </div>
                )}
                {isPdf(document) && (
                  <span className="absolute top-2 left-2 rounded bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    PDF
                  </span>
                )}
              </div>

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <AppText type="caption" className="font-semibold">
                    {DOCUMENT_LABELS[document.type] ?? document.type}
                  </AppText>
                  <StatusBadge
                    label={statusLabel(document.status)}
                    className={statusBadgeClass(document.status)}
                  />
                </div>

                {document.rejection_reason && (
                  <AppText type="caption" className="text-destructive block">
                    {document.rejection_reason}
                  </AppText>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewing(document)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <a
                    href={document.url}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="border-border hover:bg-muted inline-flex flex-1 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View + decide on a single document */}
      <AppDialog
        isOpen={!!viewing}
        onOpenChange={(open) => !open && setViewing(null)}
        title={
          viewing ? (DOCUMENT_LABELS[viewing.type] ?? viewing.type) : "Document"
        }
        width="640px"
        dialogFooter={
          viewing && (
            <div className="flex w-full flex-wrap justify-end gap-3">
              <Button
                variant="outline"
                disabled={isReviewingDocument || viewing.status === "REJECTED"}
                onClick={() => {
                  setRejecting(viewing);
                  setViewing(null);
                }}
                className="text-destructive border-red-200 hover:bg-red-50"
              >
                Reject Document
              </Button>
              <Button
                isLoading={isReviewingDocument}
                disabled={viewing.status === "APPROVED"}
                onClick={() =>
                  reviewDocument({
                    documentId: viewing.id,
                    status: "APPROVED",
                  })
                }
              >
                Approve Document
              </Button>
            </div>
          )
        }
      >
        {viewing &&
          (isPdf(viewing) ? (
            <div className="space-y-2">
              <iframe
                src={viewing.url}
                title={DOCUMENT_LABELS[viewing.type] ?? viewing.type}
                className="h-[28rem] w-full rounded-lg border bg-slate-50"
              />
              <a
                href={viewing.url}
                target="_blank"
                rel="noreferrer"
                className="text-brand inline-flex items-center gap-1 text-sm font-medium hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Open PDF in a new tab
              </a>
            </div>
          ) : (
            <div className="relative h-96 w-full overflow-hidden rounded-lg bg-slate-50">
              <Image
                src={viewing.url}
                alt={DOCUMENT_LABELS[viewing.type] ?? viewing.type}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          ))}
      </AppDialog>

      {/* Reject a single document with actionable reasons */}
      <AppDialog
        isOpen={!!rejecting}
        onOpenChange={(open) => !open && closeRejectForm()}
        title="Reject document"
        description={`Give ${driverName || "the driver"} a reason they can act on - it is sent with the resubmission notice.`}
        width="520px"
        dialogFooter={
          <div className="flex w-full justify-end gap-3">
            <Button variant="outline" onClick={closeRejectForm}>
              Cancel
            </Button>
            <Button
              isLoading={isReviewingDocument}
              disabled={!reasons.length && !note.trim()}
              onClick={rejectDocument}
              className="bg-destructive hover:bg-destructive/90"
            >
              Confirm Rejection
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-3">
            {REJECTION_REASONS.map((reason) => (
              <label
                key={reason}
                className="flex cursor-pointer items-center gap-3 text-sm"
              >
                <Checkbox
                  checked={reasons.includes(reason)}
                  onCheckedChange={(checked) =>
                    setReasons((current) =>
                      checked
                        ? [...current, reason]
                        : current.filter((item) => item !== reason),
                    )
                  }
                />
                {reason}
              </label>
            ))}
          </div>

          <AppTextArea
            label="Additional note (optional)"
            placeholder="Add a note for the driver..."
            value={note}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNote(event.target.value)
            }
          />

          <AppText
            type="caption"
            className="block rounded-lg bg-amber-50 p-3 text-amber-800"
          >
            {driverName || "The driver"} will receive an in-app notification
            with the reason for rejection and instructions to resubmit.
          </AppText>
        </div>
      </AppDialog>

      {/* Whole-submission decisions */}
      <ConfirmDialog
        isOpen={approveOpen}
        onOpenChange={setApproveOpen}
        title={`Approve ${driverName || "this driver"}?`}
        description="This also auto-approves every submitted document that hasn't been reviewed yet. Their profile becomes visible to clients immediately and they are notified by email."
        confirmLabel="Approve Driver"
        isLoading={isReviewingSubmission}
        onConfirm={() => reviewSubmission({ status: "APPROVED" })}
      />

      <AppDialog
        isOpen={rejectSubmissionOpen}
        onOpenChange={(open) => {
          setRejectSubmissionOpen(open);
          if (!open) setSubmissionReason("");
        }}
        title="Reject application"
        description="The reason is sent to the driver with resubmission instructions."
        width="520px"
        dialogFooter={
          <div className="flex w-full justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setRejectSubmissionOpen(false)}
            >
              Cancel
            </Button>
            <Button
              isLoading={isReviewingSubmission}
              disabled={!submissionReason.trim()}
              onClick={() =>
                reviewSubmission({
                  status: "REJECTED",
                  rejection_reason: submissionReason.trim(),
                })
              }
              className="bg-destructive hover:bg-destructive/90"
            >
              Confirm Rejection
            </Button>
          </div>
        }
      >
        <AppTextArea
          label="Reason"
          placeholder="Tell the driver what needs fixing..."
          value={submissionReason}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
            setSubmissionReason(event.target.value)
          }
        />
      </AppDialog>
    </div>
  );
};
