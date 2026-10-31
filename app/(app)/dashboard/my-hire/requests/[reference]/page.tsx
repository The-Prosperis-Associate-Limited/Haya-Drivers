"use client";

import { AppDropzone } from "@/components/shared/app-dropzone";
import { AppText } from "@/components/shared/app-text";
import { AppTextArea } from "@/components/shared/app-textarea";
import { BackLink } from "@/components/shared/back-link";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import {
  HIRE_REQUEST_STATUS_LABELS,
  HIRE_REQUEST_STATUS_STYLES,
} from "@/components/hires/hire-request-row";
import { TrustRing } from "@/components/drivers/trust-ring";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { showToast } from "@/lib/show-toast";
import {
  cn,
  driverTypeLabel,
  formatDate,
  formatMoney,
  invoiceLines,
  getInitials,
  HIRE_ENGAGEMENT_LABELS,
  TRANSMISSION_OPTIONS,
  WORK_SCHEDULE_LABELS,
} from "@/lib/utils";
import {
  Copy,
  FileQuestion,
  Landmark,
  Lock,
  LockOpen,
  Mail,
  MapPin,
  Phone,
  Search,
  UploadCloud,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import type { APIResponse } from "@/types/response";
import type { HireRequest } from "@/types/hire";

const STATUS_COPY: Record<string, string> = {
  PENDING_REVIEW:
    "Our team is reviewing this request. You'll get a notification the moment your invoice is ready.",
  INVOICED:
    "Your invoice is ready. Transfer the total to our account below, then upload your proof of payment.",
  PAYMENT_REVIEW:
    "We're confirming your transfer. The driver's verified details unlock the moment it's confirmed.",
  PAID: "Paid - the driver's verified details are yours below.",
  DECLINED: "This request was declined.",
  CANCELLED: "You cancelled this request.",
};

export default function HireRequestDetail({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = use(params);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofNote, setProofNote] = useState("");

  const detailUrl = API_ENDPOINTS.hireRequests.detail(reference);
  const { data, isFetching } = useGetData<APIResponse<HireRequest>>({
    url: detailUrl,
  });

  const request = data?.data;
  const invoice = request?.invoice;
  const awaitingPayment =
    request?.status === "INVOICED" && invoice?.status === "UNPAID";

  const { mutate: submitProof, isPending: isSubmittingProof } = useSubmitData<
    FormData,
    APIResponse<HireRequest>
  >({
    url: API_ENDPOINTS.hireRequests.proof(reference),
    onSuccessMessage: "Proof submitted - we'll confirm your payment shortly",
    onSuccess: () => {
      setProofFile(null);
      setProofNote("");
    },
  });

  const { mutate: cancel, isPending: isCancelling } = useSubmitData({
    url: API_ENDPOINTS.hireRequests.cancel(reference),
    onSuccessMessage: "Request cancelled",
  });

  const handleSubmitProof = () => {
    if (!proofFile) return;
    const formData = new FormData();
    formData.append("file", proofFile);
    if (proofNote.trim()) formData.append("note", proofNote.trim());
    submitProof(formData);
  };

  const copy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    showToast("success", `${label} copied`);
  };

  if (!request) {
    return (
      <div className="mx-auto max-w-[1360px] space-y-4">
        <BackLink href="/dashboard/my-hire" label="Back to My Hire" />
        {isFetching ? (
          <>
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </>
        ) : (
          <EmptyState
            icon={FileQuestion}
            title="Request not found"
            description="This hire request is no longer available."
          />
        )}
      </div>
    );
  }

  const assignedDrivers = request.assignments?.length
    ? request.assignments.map((assignment) => assignment.driver)
    : request.driver
      ? [request.driver]
      : [];
  const packs = request.combo_pack;
  const account = request.payment_account;
  const rejectedReason = invoice?.proof_rejected_reason;

  return (
    <div className="mx-auto max-w-[1360px]">
      <BackLink href="/dashboard/my-hire" label="Back to My Hire" />

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="flex items-center gap-2">
            <AppText
              type="h2"
              className="text-[22px] font-semibold tracking-tight"
            >
              Hire request
            </AppText>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                HIRE_REQUEST_STATUS_STYLES[request.status],
              )}
            >
              {HIRE_REQUEST_STATUS_LABELS[request.status]}
            </span>
          </span>
          <AppText
            type="caption"
            className="text-muted-foreground mt-1 block text-xs"
          >
            {request.reference} · Submitted {formatDate(request.createdAt)}
          </AppText>
        </div>

        {["PENDING_REVIEW", "INVOICED"].includes(request.status) && (
          <Button
            variant="outline"
            className="text-destructive border-destructive/40 h-10 rounded-lg px-4 text-sm"
            onClick={() => setCancelOpen(true)}
          >
            <XCircle className="h-4 w-4" />
            Cancel request
          </Button>
        )}
      </div>

      <AppText type="caption" className="text-muted-foreground mt-3 block">
        {request.status === "DECLINED" && request.declined_reason
          ? `${STATUS_COPY.DECLINED} Reason: ${request.declined_reason}`
          : STATUS_COPY[request.status]}
      </AppText>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* The engagement summary */}
          <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
            {assignedDrivers.length ? (
              <div className="space-y-4">
                {assignedDrivers.map((driver) => (
                  <div key={driver.id} className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage
                        src={driver.profile_pic ?? undefined}
                        alt=""
                      />
                      <AvatarFallback>
                        {getInitials(driver.first_name, driver.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <AppText type="h3" className="text-[15px] font-semibold">
                        {[driver.first_name, driver.last_name]
                          .filter(Boolean)
                          .join(" ") || "Driver"}
                      </AppText>
                      <AppText
                        type="caption"
                        className="text-muted-foreground block text-xs"
                      >
                        {[
                          driverTypeLabel(
                            driver.driver_profile?.driver_type ?? undefined,
                          ),
                          [driver.city, driver.state_of_residence]
                            .filter(Boolean)
                            .join(", "),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </AppText>
                    </div>
                    <TrustRing
                      score={driver.driver_profile?.trust_score ?? 0}
                      size={52}
                    />
                  </div>
                ))}
                {assignedDrivers.length < request.drivers_needed && (
                  <AppText
                    type="caption"
                    className="text-muted-foreground block text-xs"
                  >
                    {request.drivers_needed - assignedDrivers.length} more
                    driver(s) still being matched.
                  </AppText>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className="bg-brand/10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full">
                  <Search className="text-brand h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <AppText type="h3" className="text-[15px] font-semibold">
                    We're matching{" "}
                    {request.drivers_needed > 1
                      ? `${request.drivers_needed} drivers`
                      : "a driver"}{" "}
                    for you
                  </AppText>
                  <AppText
                    type="caption"
                    className="text-muted-foreground block text-xs"
                  >
                    Our team is picking vetted drivers that fit your
                    requirements below.
                  </AppText>
                </div>
              </div>
            )}

            <div className="border-border mt-4 grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-3">
              {[
                {
                  label: "Engagement",
                  value: HIRE_ENGAGEMENT_LABELS[request.engagement_type],
                },
                { label: "Starts", value: formatDate(request.starts_at) },
                {
                  label: "Schedule",
                  value: WORK_SCHEDULE_LABELS[request.schedule],
                },
                request.resumption_time || request.closing_time
                  ? {
                      label: "Hours",
                      value: [request.resumption_time, request.closing_time]
                        .filter(Boolean)
                        .join(" - "),
                    }
                  : null,
                request.transmission
                  ? {
                      label: "Transmission",
                      value:
                        TRANSMISSION_OPTIONS.find(
                          (o) => o.value === request.transmission,
                        )?.label ?? request.transmission,
                    }
                  : null,
                request.duration_months
                  ? {
                      label: "Duration",
                      value: `${request.duration_months} month${request.duration_months > 1 ? "s" : ""}`,
                    }
                  : null,
                request.duration_days
                  ? {
                      label: "Contract length",
                      value: `${request.duration_days} day${request.duration_days > 1 ? "s" : ""}`,
                    }
                  : null,
                request.preferred_ethnicity
                  ? { label: "Ethnicity", value: request.preferred_ethnicity }
                  : null,
                request.preferred_religion
                  ? { label: "Religion", value: request.preferred_religion }
                  : null,
                request.preferred_age_range
                  ? { label: "Age range", value: request.preferred_age_range }
                  : null,
                !assignedDrivers.length && request.driver_type
                  ? {
                      label: "Driver type",
                      value: driverTypeLabel(request.driver_type),
                    }
                  : null,
                request.state
                  ? {
                      label: "Location",
                      value: [request.nearest_area, request.state]
                        .filter(Boolean)
                        .join(", "),
                    }
                  : null,
              ]
                .filter((row) => row !== null)
                .map((row) => (
                  <div key={row.label}>
                    <AppText
                      type="caption"
                      className="text-muted-foreground text-xs"
                    >
                      {row.label}
                    </AppText>
                    <AppText
                      type="label"
                      className="block text-sm font-semibold"
                    >
                      {row.value}
                    </AppText>
                  </div>
                ))}
            </div>

            {request.note && (
              <AppText
                type="caption"
                className="text-muted-foreground border-border mt-4 block border-t pt-4 text-sm"
              >
                &ldquo;{request.note}&rdquo;
              </AppText>
            )}
          </div>

          {/* The combo pack - locked until paid */}
          <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
            <span className="flex items-center gap-2">
              {packs?.length ? (
                <LockOpen className="h-4 w-4 text-emerald-600" />
              ) : (
                <Lock className="text-muted-foreground h-4 w-4" />
              )}
              <AppText type="h4" className="text-[15px] font-semibold">
                Driver contact details
              </AppText>
            </span>

            {packs?.length ? (
              <div className="mt-4 space-y-5">
                {packs.map((pack, index) => (
                  <div key={pack.email ?? index} className="space-y-3">
                    {packs.length > 1 && (
                      <AppText type="label" className="block text-sm font-bold">
                        {[pack.first_name, pack.last_name]
                          .filter(Boolean)
                          .join(" ") || `Driver ${index + 1}`}
                      </AppText>
                    )}
                    {[
                      { icon: Phone, label: "Phone", value: pack.phone_no },
                      {
                        icon: Phone,
                        label: "WhatsApp",
                        value: pack.whatsapp_number,
                      },
                      { icon: Mail, label: "Email", value: pack.email },
                      {
                        icon: MapPin,
                        label: "Location",
                        value: [pack.city, pack.state_of_residence]
                          .filter(Boolean)
                          .join(", "),
                      },
                    ]
                      .filter((row) => row.value)
                      .map((row) => {
                        const Icon = row.icon;
                        return (
                          <span
                            key={row.label}
                            className="flex items-center justify-between gap-3"
                          >
                            <span className="flex items-center gap-3">
                              <span className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                                <Icon className="text-muted-foreground h-4 w-4" />
                              </span>
                              <AppText
                                type="caption"
                                className="text-muted-foreground"
                              >
                                {row.label}
                              </AppText>
                            </span>
                            <AppText
                              type="label"
                              className="text-sm font-semibold"
                            >
                              {row.value}
                            </AppText>
                          </span>
                        );
                      })}
                  </div>
                ))}

                {request.booking && (
                  <AppText
                    type="caption"
                    className="text-muted-foreground border-border block border-t pt-3 text-xs"
                  >
                    {assignedDrivers.length > 1
                      ? "These engagements now live in "
                      : "This engagement now lives in "}
                    <Link
                      href={
                        assignedDrivers.length > 1
                          ? "/dashboard/my-hire"
                          : `/dashboard/my-hire/${request.booking.reference}`
                      }
                      className="text-brand font-semibold underline underline-offset-2"
                    >
                      My Hire
                    </Link>{" "}
                    - reviews happen there.
                  </AppText>
                )}
              </div>
            ) : (
              <AppText
                type="caption"
                className="text-muted-foreground mt-3 block text-sm"
              >
                The verified phone, WhatsApp and email of your{" "}
                {request.drivers_needed > 1 ? "drivers" : "driver"} unlock here
                once your payment is confirmed.
              </AppText>
            )}
          </div>
        </div>

        {/* The invoice */}
        <div className="border-border h-fit rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
          <AppText type="h4" className="text-[15px] font-semibold">
            Invoice
          </AppText>

          {!invoice ? (
            <AppText
              type="caption"
              className="text-muted-foreground mt-3 block text-sm"
            >
              No invoice yet - our team is reviewing this request.
            </AppText>
          ) : (
            <>
              <AppText
                type="caption"
                className="text-muted-foreground mt-1 block text-xs"
              >
                {invoice.reference} · Issued {formatDate(invoice.createdAt)}
              </AppText>

              <div className="mt-4 space-y-2.5">
                {invoiceLines(invoice)
                  .map((line) => ({
                    label: line.label,
                    value: formatMoney(line.amount_minor, invoice.currency),
                  }))
                  .map((row) => (
                    <span
                      key={row.label}
                      className="flex items-center justify-between gap-3"
                    >
                      <AppText type="caption" className="text-muted-foreground">
                        {row.label}
                      </AppText>
                      <AppText type="label" className="shrink-0 text-sm">
                        {row.value}
                      </AppText>
                    </span>
                  ))}

                <span className="border-border flex items-center justify-between border-t pt-2.5">
                  <AppText type="label" className="text-sm font-bold">
                    Total
                  </AppText>
                  <AppText type="label" className="text-[15px] font-semibold">
                    {formatMoney(invoice.total_minor, invoice.currency)}
                  </AppText>
                </span>

                {invoice.per_driver_minor &&
                (invoice.breakdown?.length ||
                  invoice.amount_minor === invoice.fee_minor) ? (
                  <AppText
                    type="caption"
                    className="text-muted-foreground block pt-1 text-xs"
                  >
                    Your driver{request.drivers_needed > 1 ? "s'" : "'s"} salary
                    ({formatMoney(invoice.per_driver_minor, invoice.currency)}
                    /month{request.drivers_needed > 1 ? " each" : ""}) is paid
                    by you to the driver
                    {request.drivers_needed > 1 ? "s" : ""} directly - it is not
                    part of this invoice.
                  </AppText>
                ) : null}
              </div>

              {invoice.note && (
                <AppText
                  type="caption"
                  className="text-muted-foreground mt-3 block text-xs"
                >
                  {invoice.note}
                </AppText>
              )}

              {account && (
                <div className="bg-muted/50 mt-4 rounded-xl p-4">
                  <span className="flex items-center gap-2">
                    <Landmark className="text-brand h-4 w-4" />
                    <AppText type="label" className="text-sm font-semibold">
                      Pay by bank transfer
                    </AppText>
                  </span>
                  <div className="mt-3 space-y-2">
                    {[
                      { label: "Bank", value: account.bank_name },
                      {
                        label: "Account number",
                        value: account.account_number,
                      },
                      { label: "Account name", value: account.account_name },
                    ].map((row) => (
                      <span
                        key={row.label}
                        className="flex items-center justify-between gap-2"
                      >
                        <AppText
                          type="caption"
                          className="text-muted-foreground text-xs"
                        >
                          {row.label}
                        </AppText>
                        <span className="flex items-center gap-1.5">
                          <AppText
                            type="label"
                            className="text-sm font-semibold"
                          >
                            {row.value}
                          </AppText>
                          <button
                            type="button"
                            aria-label={`Copy ${row.label.toLowerCase()}`}
                            className="text-muted-foreground hover:text-brand transition-colors"
                            onClick={() => copy(row.label, row.value)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      </span>
                    ))}
                  </div>
                  <AppText
                    type="caption"
                    className="text-muted-foreground mt-3 block text-xs"
                  >
                    Transfer exactly{" "}
                    <span className="text-foreground font-semibold">
                      {formatMoney(invoice.total_minor, invoice.currency)}
                    </span>{" "}
                    and use{" "}
                    <span className="text-foreground font-semibold">
                      {request.reference}
                    </span>{" "}
                    as the transfer narration.
                  </AppText>
                </div>
              )}

              {rejectedReason && awaitingPayment && (
                <div className="mt-4 rounded-xl bg-red-50 p-3">
                  <AppText
                    type="caption"
                    className="block text-xs text-red-600"
                  >
                    Your last proof wasn't accepted: {rejectedReason} Please
                    upload a valid receipt.
                  </AppText>
                </div>
              )}

              {awaitingPayment && (
                <div className="mt-4 space-y-3">
                  <AppDropzone
                    label="Proof of payment"
                    hint="JPG, PNG or PDF, up to 5MB"
                    accept={{
                      "image/jpeg": [],
                      "image/png": [],
                      "application/pdf": [],
                    }}
                    maxSize={5 * 1024 * 1024}
                    value={proofFile}
                    onChange={(file) => setProofFile(file as File | null)}
                  />
                  <AppTextArea
                    label="Note (optional)"
                    placeholder="E.g the account the transfer came from"
                    value={proofNote}
                    onChange={(event) => setProofNote(event.target.value)}
                    rows={2}
                  />
                  <Button
                    className="h-12 w-full rounded-lg text-sm"
                    disabled={!proofFile || isSubmittingProof}
                    onClick={handleSubmitProof}
                  >
                    <UploadCloud className="h-4 w-4" />
                    {isSubmittingProof
                      ? "Submitting…"
                      : "Submit proof of payment"}
                  </Button>
                </div>
              )}

              {invoice.status === "PAYMENT_REVIEW" && (
                <AppText
                  type="caption"
                  className="mt-4 block text-xs font-semibold text-purple-600"
                >
                  Proof submitted{" "}
                  {invoice.proof_submitted_at
                    ? formatDate(invoice.proof_submitted_at)
                    : ""}{" "}
                  - we're confirming your transfer.
                </AppText>
              )}

              {invoice.status === "PAID" && (
                <AppText
                  type="caption"
                  className="mt-4 block text-center text-xs font-semibold text-emerald-600"
                >
                  Paid {invoice.paid_at ? formatDate(invoice.paid_at) : ""}
                </AppText>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={cancelOpen}
        onOpenChange={setCancelOpen}
        icon={XCircle}
        iconClassName="text-destructive"
        title="Cancel this hire request?"
        description="The request closes and any invoice on it is voided. You can always request this driver again."
        confirmLabel="Cancel request"
        confirmVariant="destructive"
        isLoading={isCancelling}
        onConfirm={() => {
          cancel({});
          setCancelOpen(false);
        }}
      />
    </div>
  );
}
