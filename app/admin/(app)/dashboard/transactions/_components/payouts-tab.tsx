"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { AppSimpleSelect } from "@/components/shared/app-simple-select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { AppTextArea } from "@/components/shared/app-textarea";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import {
  downloadCsv,
  personName,
  statusBadgeClass,
  statusLabel,
} from "@/lib/admin";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate, formatMoney } from "@/lib/utils";
import { useState } from "react";
import type { PaginatedResponse } from "@/types/response";
import type { AdminPayoutRow } from "@/types/admin";
import { DetailRow } from "../../../_components/detail-card";

const STATUS_OPTIONS = [
  { value: "REQUESTED", label: "Requested" },
  { value: "PROCESSING", label: "Processing" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "REVERSED", label: "Reversed" },
];

export const PayoutsTab = function () {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("REQUESTED");
  const [viewing, setViewing] = useState<AdminPayoutRow | null>(null);
  const [paying, setPaying] = useState<AdminPayoutRow | null>(null);
  const [failing, setFailing] = useState<AdminPayoutRow | null>(null);
  const [failureReason, setFailureReason] = useState("");

  const listUrl = API_ENDPOINTS.adminTransactions.payouts({
    page,
    limit: 10,
    status,
  });

  const { data, isFetching } = useGetData<PaginatedResponse<AdminPayoutRow>>({
    url: listUrl,
  });

  const rows = data?.data ?? [];

  const { mutate: settle, isPending: isSettling } = useSubmitData<{
    reference: string;
    status: "PAID" | "FAILED";
    failure_reason?: string;
  }>({
    url: ({ reference }) =>
      API_ENDPOINTS.adminTransactions.settlePayout(reference),
    getBody: ({ status: nextStatus, failure_reason }) => ({
      status: nextStatus,
      failure_reason,
    }),
    method: "patch",
    onSuccessMessage: "Payout updated",
    additionalQueryKeys: [[listUrl]],
    onSuccess: () => {
      setPaying(null);
      setFailing(null);
      setFailureReason("");
    },
  });

  const downloadReceipt = (row: AdminPayoutRow) =>
    downloadCsv(
      `${row.reference}.csv`,
      ["Reference", "Driver", "Amount", "Status", "Bank", "Account", "Date"],
      [
        [
          row.reference,
          personName(row.user),
          formatMoney(row.amount_minor, row.currency),
          row.status,
          row.bankAccount?.bank_name ?? "-",
          row.bankAccount?.account_number ?? "-",
          formatDate(row.createdAt),
        ],
      ],
    );

  const rowActions = (row: AdminPayoutRow) => {
    const actions = [{ value: "view", label: "View details" }];

    if (row.status === "REQUESTED" || row.status === "PROCESSING") {
      actions.push(
        { value: "pay", label: "Release Funds" },
        { value: "fail", label: "Mark as Failed" },
      );
    }

    actions.push({ value: "receipt", label: "Download Receipt" });

    return actions;
  };

  const onAction = (row: AdminPayoutRow, action: string) => {
    if (action === "view") setViewing(row);
    if (action === "pay") setPaying(row);
    if (action === "fail") setFailing(row);
    if (action === "receipt") downloadReceipt(row);
  };

  return (
    <>
      <div className="flex justify-end">
        <AppSimpleSelect
          options={STATUS_OPTIONS}
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          containerClassName="w-[150px]"
        />
      </div>

      <Pagination
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        total={data?.total}
        isLoading={isFetching}
      >
        {!rows.length ? (
          <EmptyState
            title="No payouts here"
            description="Driver withdrawal requests land in this queue."
          />
        ) : (
          <>
            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="w-full text-sm [&_td:first-child]:pl-3 [&_th]:py-2.5 [&_th:first-child]:pl-3">
                <thead>
                  <tr className="bg-slate-50 text-left text-[11.5px] font-semibold tracking-wide text-slate-500 uppercase">
                    <th className="py-3 pr-4 font-medium">Payout</th>
                    <th className="py-3 pr-4 font-medium">Driver</th>
                    <th className="py-3 pr-4 font-medium">Bank</th>
                    <th className="py-3 pr-4 font-medium">Amount</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 pr-4 font-medium">{row.reference}</td>
                      <td className="py-3 pr-4">
                        <span className="block">{personName(row.user)}</span>
                        <span className="text-muted-foreground block text-xs">
                          {formatDate(row.createdAt)}
                        </span>
                      </td>
                      <td className="text-muted-foreground py-3 pr-4">
                        {row.bankAccount
                          ? `${row.bankAccount.bank_name} ·· ${row.bankAccount.account_number.slice(-4)}`
                          : "-"}
                      </td>
                      <td className="py-3 pr-4 font-semibold">
                        {formatMoney(row.amount_minor, row.currency)}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge
                          label={statusLabel(row.status)}
                          className={statusBadgeClass(row.status)}
                        />
                      </td>
                      <td className="py-3 text-right">
                        <AppSimpleSelect
                          triggerVariant="ellipsis"
                          options={rowActions(row)}
                          onValueChange={(action) => onAction(row, action)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-3 md:hidden">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="border-border rounded-xl border p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{row.reference}</span>
                    <AppSimpleSelect
                      triggerVariant="ellipsis"
                      options={rowActions(row)}
                      onValueChange={(action) => onAction(row, action)}
                    />
                  </div>
                  <p className="mt-1 text-sm font-semibold">
                    {formatMoney(row.amount_minor, row.currency)}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {personName(row.user)} · {statusLabel(row.status)} ·{" "}
                    {formatDate(row.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </Pagination>

      <AppDialog
        isOpen={!!viewing}
        onOpenChange={(open) => !open && setViewing(null)}
        title={viewing ? `Payout ${viewing.reference}` : "Payout"}
        width="480px"
        dialogFooter={
          viewing && (
            <Button variant="outline" onClick={() => downloadReceipt(viewing)}>
              Download Receipt
            </Button>
          )
        }
      >
        {viewing && (
          <div className="divide-border divide-y">
            <DetailRow label="Driver" value={personName(viewing.user)} />
            <DetailRow
              label="Amount"
              value={formatMoney(viewing.amount_minor, viewing.currency)}
            />
            <DetailRow
              label="Status"
              value={
                <StatusBadge
                  label={statusLabel(viewing.status)}
                  className={statusBadgeClass(viewing.status)}
                />
              }
            />
            <DetailRow
              label="Bank"
              value={
                viewing.bankAccount
                  ? `${viewing.bankAccount.bank_name} - ${viewing.bankAccount.account_name}`
                  : "-"
              }
            />
            <DetailRow
              label="Account"
              value={
                viewing.bankAccount
                  ? `·· ${viewing.bankAccount.account_number.slice(-4)}`
                  : "-"
              }
            />
            <DetailRow
              label="Requested"
              value={formatDate(viewing.createdAt)}
            />
            {viewing.failure_reason && (
              <DetailRow
                label="Failure reason"
                value={viewing.failure_reason}
              />
            )}
          </div>
        )}
      </AppDialog>

      <ConfirmDialog
        isOpen={!!paying}
        onOpenChange={(open) => !open && setPaying(null)}
        title={
          paying
            ? `Release ${formatMoney(paying.amount_minor, paying.currency)}?`
            : ""
        }
        description="Marks the payout as paid - the driver's wallet debit becomes final and they are notified."
        confirmLabel="Release Funds"
        isLoading={isSettling}
        onConfirm={() =>
          paying && settle({ reference: paying.reference, status: "PAID" })
        }
      />

      <AppDialog
        isOpen={!!failing}
        onOpenChange={(open) => {
          if (!open) {
            setFailing(null);
            setFailureReason("");
          }
        }}
        title="Mark payout as failed"
        description="The wallet debit is reversed exactly as a provider failure would - the driver keeps the money."
        width="480px"
        dialogFooter={
          <div className="flex w-full justify-end gap-3">
            <Button variant="outline" onClick={() => setFailing(null)}>
              Cancel
            </Button>
            <Button
              isLoading={isSettling}
              disabled={!failureReason.trim()}
              onClick={() =>
                failing &&
                settle({
                  reference: failing.reference,
                  status: "FAILED",
                  failure_reason: failureReason.trim(),
                })
              }
              className="bg-destructive hover:bg-destructive/90"
            >
              Mark as Failed
            </Button>
          </div>
        }
      >
        <AppTextArea
          label="Failure reason"
          placeholder="E.g. bank account could not be resolved"
          value={failureReason}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFailureReason(event.target.value)
          }
        />
      </AppDialog>
    </>
  );
};
