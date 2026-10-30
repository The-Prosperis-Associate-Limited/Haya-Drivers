"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { AppInput } from "@/components/shared/app-input";
import { AppText } from "@/components/shared/app-text";
import { AppTextArea } from "@/components/shared/app-textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  HIRE_REQUEST_STATUS_LABELS,
  HIRE_REQUEST_STATUS_STYLES,
} from "@/components/hires/hire-request-row";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { clientName } from "@/lib/admin";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  cn,
  driverTypeLabel,
  formatDate,
  formatDateTime,
  formatMoney,
  getInitials,
  HIRE_ENGAGEMENT_LABELS,
  HIRE_PACKAGE_OPTIONS,
  TRANSMISSION_OPTIONS,
  WORK_SCHEDULE_LABELS,
} from "@/lib/utils";
import {
  BadgeCheck,
  Clock3,
  ExternalLink,
  ReceiptText,
  Search,
  UserPlus,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { PricingGuideDialog } from "./pricing-guide-dialog";
import type { AdminUserRow } from "@/types/admin";
import type { HireInvoiceQuote, HireRequest } from "@/types/hire";
import type { APIResponse, PaginatedResponse } from "@/types/response";

interface Props {
  request: HireRequest;
}

const DEFAULT_VAT = 7.5;

export const HireRequestCard = function ({ request }: Props) {
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [driverSearch, setDriverSearch] = useState("");

  const assigned = request.assignments?.length
    ? request.assignments
    : request.driver
      ? [
          {
            id: request.driver.id,
            driverId: request.driver.id,
            status: "PENDING" as const,
            responded_at: null,
            respond_by: null,
            expired_at: null,
            driver: request.driver,
          },
        ]
      : [];
  const assignedCount = request.assignments?.length ?? 0;
  const fullyAssigned = assignedCount >= request.drivers_needed;

  // The invoice default: the highest advertised rate among assigned drivers.
  const rate = assigned.length
    ? Math.max(
        ...assigned.map(
          (entry) => entry.driver.driver_profile?.expected_monthly_rate ?? 0,
        ),
      ) || null
    : null;
  const currency = assigned[0]?.driver.driver_profile?.rate_currency ?? "NGN";

  // Naira input for the admin, kobo on the wire.
  const [amountMajor, setAmountMajor] = useState(
    rate ? String(Math.round(rate / 100)) : "",
  );
  const [vatPercent, setVatPercent] = useState(String(DEFAULT_VAT));
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const driver = assigned[0]?.driver ?? null;
  const baseName = driver
    ? [driver.first_name, driver.last_name].filter(Boolean).join(" ") ||
      "Driver"
    : "Unassigned";
  const driverName =
    assigned.length > 1 ? `${baseName} +${assigned.length - 1} more` : baseName;
  const requester = request.client ? clientName(request.client) : "Client";
  const invoice = request.invoice;

  const amountMinor = Math.round(Number(amountMajor || 0) * 100);

  // The server owns the pricing maths - the dialog shows its quote verbatim.
  const debouncedAmount = useDebounce(amountMajor, 400);
  const debouncedVat = useDebounce(vatPercent, 400);
  const quoteParams = new URLSearchParams();
  if (Number(debouncedAmount) > 0)
    quoteParams.set(
      "amount_minor",
      String(Math.round(Number(debouncedAmount) * 100)),
    );
  if (debouncedVat !== "") quoteParams.set("vat_percent", debouncedVat);

  const { data: quoteData, isFetching: isQuoting } = useGetData<
    APIResponse<HireInvoiceQuote>
  >({
    url: API_ENDPOINTS.adminHires.invoiceQuote(
      request.reference,
      quoteParams.toString(),
    ),
    shouldFetch:
      invoiceOpen && request.status === "PENDING_REVIEW" && fullyAssigned,
  });
  const quote = quoteData?.data;

  const debouncedSearch = useDebounce(driverSearch, 400);
  const { data: driverResults, isFetching: isSearching } = useGetData<
    PaginatedResponse<AdminUserRow>
  >({
    url: API_ENDPOINTS.adminUsers.list({
      page: 1,
      limit: 6,
      role: "DRIVER",
      ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
    }),
    shouldFetch: assignOpen,
  });

  const candidates = (driverResults?.data ?? []).filter(
    (row) =>
      row.driver_profile?.verification_status === "APPROVED" &&
      !assigned.some((entry) => entry.driver.id === row.id),
  );

  const { mutate: generate, isPending: isGenerating } = useSubmitData<{
    amount_minor: number;
    vat_percent: number;
    note?: string;
  }>({
    url: API_ENDPOINTS.adminHires.invoice(request.reference),
    onSuccessMessage: "Invoice generated and sent to the client",
    onSuccess: () => setInvoiceOpen(false),
  });

  const { mutate: decline, isPending: isDeclining } = useSubmitData<{
    reason: string;
  }>({
    url: API_ENDPOINTS.adminHires.decline(request.reference),
    onSuccessMessage: "Request declined",
    onSuccess: () => setDeclineOpen(false),
  });

  const { mutate: assign, isPending: isAssigning } = useSubmitData<{
    driverId: string;
  }>({
    url: API_ENDPOINTS.adminHires.assign(request.reference),
    onSuccessMessage: "Candidate added - availability ping sent",
  });

  const { mutate: unassign, isPending: isUnassigning } = useSubmitData<{
    driverId: string;
  }>({
    url: API_ENDPOINTS.adminHires.unassign(request.reference),
    onSuccessMessage: "Driver removed from the request",
  });

  const { mutate: confirmPayment, isPending: isConfirming } = useSubmitData({
    url: API_ENDPOINTS.adminHires.confirmPayment(request.reference),
    onSuccessMessage: "Payment confirmed - engagement created",
    onSuccess: () => setConfirmOpen(false),
  });

  const { mutate: rejectProof, isPending: isRejecting } = useSubmitData<{
    reason: string;
  }>({
    url: API_ENDPOINTS.adminHires.rejectProof(request.reference),
    onSuccessMessage: "Proof rejected - the client can re-upload",
    onSuccess: () => setRejectOpen(false),
  });

  const openInvoiceDialog = () => {
    if (!amountMajor && rate) setAmountMajor(String(Math.round(rate / 100)));
    setInvoiceOpen(true);
  };

  return (
    <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-11 w-11 shrink-0">
            <AvatarImage src={driver?.profile_pic ?? undefined} alt="" />
            <AvatarFallback>
              {driver ? getInitials(driver.first_name, driver.last_name) : "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <span className="flex items-center gap-2">
              <AppText type="label" className="truncate text-sm font-bold">
                {driverName}
              </AppText>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                  HIRE_REQUEST_STATUS_STYLES[request.status],
                )}
              >
                {HIRE_REQUEST_STATUS_LABELS[request.status]}
              </span>
            </span>
            <AppText
              type="caption"
              className="text-muted-foreground mt-0.5 block truncate text-xs"
            >
              Requested by {requester} · {request.reference} ·{" "}
              {formatDate(request.createdAt)}
            </AppText>
          </div>
        </div>

        {request.status === "PENDING_REVIEW" && (
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              variant={assigned.length ? "outline" : "default"}
              className="h-9 rounded-lg px-4 text-xs"
              onClick={() => setAssignOpen(true)}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Add candidates ({assignedCount}/{request.drivers_needed})
            </Button>
            {fullyAssigned && (
              <Button
                className="h-9 rounded-lg px-4 text-xs"
                onClick={openInvoiceDialog}
              >
                <ReceiptText className="h-3.5 w-3.5" />
                Generate invoice
              </Button>
            )}
            <Button
              variant="outline"
              className="text-destructive border-destructive/40 h-9 rounded-lg px-4 text-xs"
              onClick={() => setDeclineOpen(true)}
            >
              <XCircle className="h-3.5 w-3.5" />
              Decline
            </Button>
          </div>
        )}

        {request.status === "PAYMENT_REVIEW" && (
          <div className="flex shrink-0 flex-wrap gap-2">
            {invoice?.proof_url && (
              <Button
                variant="outline"
                className="h-9 rounded-lg px-4 text-xs"
                asChild
              >
                <a
                  href={invoice.proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View proof
                </a>
              </Button>
            )}
            <Button
              className="h-9 rounded-lg px-4 text-xs"
              onClick={() => setConfirmOpen(true)}
            >
              <BadgeCheck className="h-3.5 w-3.5" />
              Confirm payment
            </Button>
            <Button
              variant="outline"
              className="text-destructive border-destructive/40 h-9 rounded-lg px-4 text-xs"
              onClick={() => setRejectOpen(true)}
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject proof
            </Button>
          </div>
        )}
      </div>

      {assigned.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {assigned.map((entry) => (
            <span
              key={entry.id}
              className="bg-muted flex items-center gap-2 rounded-full py-1 pr-2 pl-1"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={entry.driver.profile_pic ?? undefined}
                  alt=""
                />
                <AvatarFallback className="text-[9px]">
                  {getInitials(entry.driver.first_name, entry.driver.last_name)}
                </AvatarFallback>
              </Avatar>
              <AppText type="caption" className="text-xs font-semibold">
                {[entry.driver.first_name, entry.driver.last_name]
                  .filter(Boolean)
                  .join(" ") || "Driver"}
              </AppText>
              {/* The availability handshake at a glance. */}
              {entry.status === "CONFIRMED" ? (
                <span title="Confirmed available">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                </span>
              ) : entry.expired_at ? (
                <span
                  className="text-muted-foreground text-[10px] font-semibold"
                  title={`Didn't reply by ${formatDateTime(entry.respond_by ?? entry.expired_at)}`}
                >
                  No reply
                </span>
              ) : entry.status === "DECLINED" ? (
                <span
                  className="text-[10px] font-semibold text-red-500"
                  title="Not available"
                >
                  Declined
                </span>
              ) : (
                <span
                  title={
                    entry.respond_by
                      ? `Awaiting availability - reply due ${formatDateTime(entry.respond_by)}`
                      : "Awaiting availability"
                  }
                >
                  <Clock3 className="h-3.5 w-3.5 text-amber-500" />
                </span>
              )}
              {request.status === "PENDING_REVIEW" && (
                <button
                  type="button"
                  aria-label={`Remove ${entry.driver.first_name ?? "driver"}`}
                  className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                  disabled={isUnassigning}
                  onClick={() => unassign({ driverId: entry.driver.id })}
                >
                  <XCircle className="h-3.5 w-3.5" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="border-border mt-4 grid grid-cols-2 gap-3 border-t pt-4 md:grid-cols-4">
        {[
          {
            label: "Engagement",
            value: HIRE_ENGAGEMENT_LABELS[request.engagement_type],
          },
          { label: "Starts", value: formatDate(request.starts_at) },
          {
            label: "Driver type",
            value: driverTypeLabel(
              driver?.driver_profile?.driver_type ??
                request.driver_type ??
                undefined,
            ),
          },
          {
            label: "Package",
            value:
              HIRE_PACKAGE_OPTIONS.find((o) => o.value === request.package)
                ?.label ?? request.package,
          },
          {
            label: "Schedule",
            value: WORK_SCHEDULE_LABELS[request.schedule] ?? request.schedule,
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
          request.drivers_needed > 1
            ? { label: "Drivers needed", value: String(request.drivers_needed) }
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
          request.state
            ? {
                label: "Location",
                value: [request.nearest_area, request.state]
                  .filter(Boolean)
                  .join(", "),
              }
            : null,
          request.insurance_cover
            ? { label: "Insurance", value: request.insurance_cover }
            : null,
          request.provides_accommodation
            ? { label: "Accommodation", value: "Provided" }
            : null,
          {
            label: invoice ? "Invoice total" : "Advertised rate",
            value: invoice
              ? formatMoney(invoice.total_minor, invoice.currency)
              : rate
                ? `${formatMoney(rate, currency)} / month`
                : "Not set",
          },
        ]
          .filter((entry) => entry !== null)
          .map((entry) => (
            <div key={entry.label}>
              <AppText type="caption" className="text-muted-foreground text-xs">
                {entry.label}
              </AppText>
              <AppText type="label" className="block text-sm font-semibold">
                {entry.value}
              </AppText>
            </div>
          ))}
      </div>

      {request.note && (
        <AppText
          type="caption"
          className="text-muted-foreground mt-3 block text-xs"
        >
          Client note: &ldquo;{request.note}&rdquo;
        </AppText>
      )}

      {invoice?.proof_note && request.status === "PAYMENT_REVIEW" && (
        <AppText
          type="caption"
          className="text-muted-foreground mt-3 block text-xs"
        >
          Payment note: &ldquo;{invoice.proof_note}&rdquo;
        </AppText>
      )}

      {request.status === "DECLINED" && request.declined_reason && (
        <AppText type="caption" className="text-destructive mt-3 block text-xs">
          Declined: {request.declined_reason}
        </AppText>
      )}

      <AppDialog
        isOpen={invoiceOpen}
        onOpenChange={setInvoiceOpen}
        title="Generate invoice"
        description="The client pays only the service fee plus VAT - driver salaries are paid to the drivers directly and are not part of this invoice."
      >
        <div className="space-y-4">
          <AppInput
            label={`Salary per driver (${currency}, per month)`}
            type="number"
            min={1}
            value={amountMajor}
            onChange={(event) => setAmountMajor(event.target.value)}
            placeholder="E.g 250000"
          />

          <AppInput
            label="VAT (%)"
            type="number"
            min={0}
            max={50}
            step="0.5"
            value={vatPercent}
            onChange={(event) => setVatPercent(event.target.value)}
          />

          <AppTextArea
            label="Note to the client (optional)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="E.g covers the first month of the engagement"
          />

          <div className="bg-brand-soft/60 space-y-1.5 rounded-xl px-4 py-3">
            {quote ? (
              <>
                {quote.lines.map((line) => (
                  <span
                    key={line.label}
                    className="flex items-center justify-between gap-3"
                  >
                    <AppText
                      type="caption"
                      className="text-muted-foreground text-xs"
                    >
                      {line.label}
                    </AppText>
                    <AppText type="label" className="shrink-0 text-sm">
                      {formatMoney(line.amount_minor, quote.currency)}
                    </AppText>
                  </span>
                ))}
                <span className="flex items-center justify-between">
                  <AppText
                    type="caption"
                    className="text-muted-foreground text-xs"
                  >
                    VAT ({quote.vat_percent}%)
                  </AppText>
                  <AppText type="label" className="text-sm">
                    {formatMoney(quote.vat_minor, quote.currency)}
                  </AppText>
                </span>
                <span className="border-border flex items-center justify-between border-t pt-1.5">
                  <AppText type="caption" className="text-xs font-semibold">
                    Invoice total
                  </AppText>
                  <AppText type="label" className="text-sm font-bold">
                    {formatMoney(quote.total_minor, quote.currency)}
                  </AppText>
                </span>
                <AppText
                  type="caption"
                  className="text-muted-foreground block pt-1 text-xs"
                >
                  Driver salary (
                  {formatMoney(quote.per_driver_minor, quote.currency)}/month
                  per driver) is paid directly to the driver
                  {quote.drivers > 1 ? "s" : ""} by the client.
                </AppText>
              </>
            ) : (
              <AppText
                type="caption"
                className="text-muted-foreground block text-xs"
              >
                {isQuoting
                  ? "Computing the quote…"
                  : "The quote appears once the shortlist is complete."}
              </AppText>
            )}
          </div>

          <PricingGuideDialog />

          <Button
            className="h-11 w-full rounded-lg text-sm"
            disabled={amountMinor <= 0 || !quote}
            isLoading={isGenerating}
            onClick={() =>
              generate({
                amount_minor: amountMinor,
                vat_percent: Number(vatPercent || 0),
                ...(note.trim() && { note: note.trim() }),
              })
            }
          >
            Issue invoice
          </Button>
        </div>
      </AppDialog>

      <AppDialog
        isOpen={assignOpen}
        onOpenChange={setAssignOpen}
        title={`Add candidates (${assignedCount} on the shortlist, ${request.drivers_needed} needed)`}
        description="Every candidate gets an availability ping - add several at once and trim to the confirmed crew before invoicing."
      >
        <div className="space-y-4">
          <AppInput
            label="Search drivers"
            icon={Search}
            value={driverSearch}
            onChange={(event) => setDriverSearch(event.target.value)}
            placeholder="Name or email"
          />

          {isSearching ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : candidates.length === 0 ? (
            <AppText
              type="caption"
              className="text-muted-foreground block text-sm"
            >
              No approved drivers match that search.
            </AppText>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="border-border flex items-center gap-3 rounded-xl border p-3"
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage
                      src={candidate.profile_pic ?? undefined}
                      alt=""
                    />
                    <AvatarFallback>
                      {getInitials(candidate.first_name, candidate.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <AppText
                      type="label"
                      className="block truncate text-sm font-semibold"
                    >
                      {[candidate.first_name, candidate.last_name]
                        .filter(Boolean)
                        .join(" ") || candidate.email}
                    </AppText>
                    <AppText
                      type="caption"
                      className="text-muted-foreground block truncate text-xs"
                    >
                      {driverTypeLabel(
                        candidate.driver_profile?.driver_type ?? undefined,
                      )}
                    </AppText>
                  </div>
                  <Button
                    className="h-8 shrink-0 rounded-lg px-3 text-xs"
                    isLoading={isAssigning}
                    onClick={() => assign({ driverId: candidate.id })}
                  >
                    Assign
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppDialog>

      <ConfirmDialog
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        icon={BadgeCheck}
        title="Confirm this payment?"
        description={`Confirming means the transfer landed in the organisation account. The engagement${
          assigned.length > 1 ? "s are" : " is"
        } created and the client unlocks the contact details immediately - driver salaries are paid to the driver${
          assigned.length > 1 ? "s" : ""
        } directly by the client.`}
        confirmLabel="Confirm payment"
        isLoading={isConfirming}
        onConfirm={() => confirmPayment({})}
      />

      <AppDialog
        isOpen={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject this proof"
        description="The client sees your reason word for word and can upload a new receipt."
      >
        <div className="space-y-4">
          <AppTextArea
            label="Reason"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="E.g the receipt doesn't match the invoice total"
          />
          <Button
            variant="destructive"
            className="h-11 w-full rounded-lg text-sm"
            disabled={rejectReason.trim().length < 5}
            isLoading={isRejecting}
            onClick={() => rejectProof({ reason: rejectReason.trim() })}
          >
            Reject proof
          </Button>
        </div>
      </AppDialog>

      <AppDialog
        isOpen={declineOpen}
        onOpenChange={setDeclineOpen}
        title="Decline this request"
        description="The client sees your reason word for word."
      >
        <div className="space-y-4">
          <AppTextArea
            label="Reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="E.g this driver is no longer available in your area"
          />
          <Button
            variant="destructive"
            className="h-11 w-full rounded-lg text-sm"
            disabled={reason.trim().length < 5}
            isLoading={isDeclining}
            onClick={() => decline({ reason: reason.trim() })}
          >
            Decline request
          </Button>
        </div>
      </AppDialog>
    </div>
  );
};
