"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Camera,
  CircleCheck,
  CircleX,
  FileText,
  House,
  IdCard,
  Loader2,
  ScanSearch,
  Trash2,
  Upload,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useRef } from "react";
import type { DocumentStatus, DocumentType } from "@/types/driver";

interface Props {
  type: DocumentType;
  label: string;
  hint?: string;
  required?: boolean;
  status?: DocumentStatus;
  fileName?: string | null;
  rejectionReason?: string | null;
  isUploading?: boolean;
  isChecking?: boolean;
  qualityIssue?: string;
  onUpload: (file: File) => void;
  onUploadAnyway?: () => void;
  onRemove?: () => void;
  onReplace?: () => void;
  accept?: string;
}

const ICONS: Partial<Record<DocumentType, LucideIcon>> = {
  NIN_SLIP: IdCard,
  PASSPORT_PHOTO: Camera,
  DRIVERS_LICENCE: IdCard,
  PROOF_OF_ADDRESS: House,
  GUARANTOR_PASSPORT: UserRound,
  GUARANTOR_NIN_SLIP: IdCard,
  CV: FileText,
};

export const DocumentRow = function ({
  type,
  label,
  hint,
  required,
  status,
  fileName,
  rejectionReason,
  isUploading,
  isChecking,
  qualityIssue,
  onUpload,
  onUploadAnyway,
  onRemove,
  onReplace,
  accept = "image/jpeg,image/png,image/jpg,application/pdf",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = isUploading || isChecking;
  const failed = !busy && (!!qualityIssue || status === "REJECTED");
  const Icon = isChecking
    ? ScanSearch
    : isUploading
      ? Loader2
      : failed
        ? CircleX
        : status === "APPROVED"
          ? CircleCheck
          : (ICONS[type] ?? FileText);
  const pick = () => (onReplace ? onReplace() : inputRef.current?.click());

  const meta = isChecking
    ? "Checking the photo…"
    : isUploading
      ? "Uploading…"
      : qualityIssue
        ? qualityIssue
        : status === "REJECTED"
          ? rejectionReason ||
            "Our team couldn't accept this file. Upload a clearer one."
          : status === "APPROVED"
            ? `Accepted${fileName ? ` · ${fileName}` : ""}`
            : status === "PENDING"
              ? `${fileName ?? "Uploaded"} · waiting for review`
              : (hint ?? "JPG, PNG or PDF · up to 5MB");

  return (
    <div
      data-document={type}
      data-status={
        isChecking
          ? "CHECKING"
          : isUploading
            ? "UPLOADING"
            : qualityIssue
              ? "QUALITY_ISSUE"
              : (status ?? "MISSING")
      }
      className={cn(
        "flex flex-wrap items-center gap-3.5 rounded-2xl border-[1.5px] border-dashed bg-white p-3.5 sm:flex-nowrap",
        status === "PENDING" && "border-solid border-slate-200",
        status === "APPROVED" &&
          "border-solid border-emerald-200 bg-linear-to-b from-emerald-50/60 to-white",
        failed &&
          "border-solid border-red-200 bg-linear-to-b from-red-50/70 to-white",
        busy && "border-brand/40 border-solid",
      )}
    >
      <span
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500",
          status === "PENDING" && "bg-brand-soft text-brand",
          status === "APPROVED" && "bg-emerald-100 text-emerald-600",
          failed && "bg-red-100 text-red-600",
          busy && "bg-brand-soft text-brand",
        )}
      >
        <Icon
          className={cn(
            "size-5",
            isUploading && "animate-spin",
            isChecking && "animate-pulse",
          )}
        />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold">
          {label}
          {required && (
            <span className="text-muted-foreground ml-1.5 rounded-full bg-slate-100 px-1.5 py-px align-[1px] text-[10.5px] font-semibold">
              Required
            </span>
          )}
        </p>
        <p
          role={qualityIssue ? "alert" : undefined}
          className={cn(
            "text-muted-foreground text-xs",
            failed && "font-medium text-red-600",
            !failed && "truncate",
          )}
        >
          {meta}
        </p>
        {onUploadAnyway && !busy && (
          <button
            type="button"
            onClick={onUploadAnyway}
            className="text-muted-foreground mt-1 text-xs font-medium underline underline-offset-2"
          >
            Still not passing? Upload it anyway for our team to check
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onUpload(file);
          event.target.value = "";
        }}
      />

      <div className="ml-auto flex shrink-0 items-center gap-1">
        {failed ? (
          <Button
            type="button"
            onClick={pick}
            disabled={busy}
            className="h-9 rounded-lg px-3 text-xs"
          >
            <Camera className="size-4" />
            {qualityIssue ? "Retake" : "Replace"}
          </Button>
        ) : status ? (
          <>
            {status !== "APPROVED" && (
              <Button
                type="button"
                variant="outline"
                onClick={pick}
                disabled={busy}
                className="h-9 rounded-lg px-3 text-xs"
              >
                Replace
              </Button>
            )}
            {onRemove && status === "PENDING" && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onRemove}
                disabled={busy}
                aria-label={`Remove ${label}`}
              >
                <Trash2 className="text-destructive size-4" />
              </Button>
            )}
          </>
        ) : (
          <Button
            type="button"
            onClick={pick}
            disabled={busy}
            className="h-9 rounded-lg px-3 text-xs"
            variant={required ? "default" : "outline"}
          >
            <Upload className="size-4" />
            Upload
          </Button>
        )}
      </div>
    </div>
  );
};
