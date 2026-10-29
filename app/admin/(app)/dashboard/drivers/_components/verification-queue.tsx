"use client";

import { AppInput } from "@/components/shared/app-input";
import { AppSimpleSelect } from "@/components/shared/app-simple-select";
import { AppText } from "@/components/shared/app-text";
import { AppAvatar } from "@/components/shared/app-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetData } from "@/hooks/use-get-data";
import {
  ADMIN_CARD,
  ADMIN_TABLE_HEAD,
  personName,
  statusBadgeClass,
  statusLabel,
} from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn, driverTypeLabel, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import type { PaginatedResponse } from "@/types/response";
import type { VerificationQueueRow } from "@/types/admin";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export const VerificationQueue = function () {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("PENDING");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data, isFetching } = useGetData<
    PaginatedResponse<VerificationQueueRow>
  >({
    url: API_ENDPOINTS.adminVerifications.queue({
      page,
      limit: 10,
      status,
      search: debouncedSearch || undefined,
    }),
  });

  const rows = data?.data ?? [];

  const documentsSummary = (row: VerificationQueueRow) => {
    const documents = row.user.documents ?? [];
    const approved = documents.filter(
      (document) => document.status === "APPROVED",
    ).length;
    return documents.length ? `${approved}/${documents.length} verified` : "-";
  };

  return (
    <div className={cn(ADMIN_CARD, "overflow-hidden")}>
      <div className="flex flex-wrap items-center gap-2 px-4 pt-4 pb-3 md:px-5 md:pt-5">
        <div className="mr-auto">
          <AppText type="h4" className="text-[15px] font-semibold">
            Verification queue
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            Submitted documents waiting on a decision
          </AppText>
        </div>
        <AppInput
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search applicants..."
          containerClassName="w-full sm:w-64"
          className="h-10 rounded-xl"
        />
        <AppSimpleSelect
          options={STATUS_OPTIONS}
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          containerClassName="w-[140px]"
        />
      </div>

      <Pagination
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        total={data?.total}
        isLoading={isFetching}
        controlsClassName="border-t border-slate-100 px-4 md:px-5"
      >
        {!rows.length ? (
          <EmptyState
            title="Nothing in the queue"
            description="Submissions land here the moment a driver completes onboarding."
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className={ADMIN_TABLE_HEAD}>
                    <th className="px-5 py-2.5 font-semibold">Applicant</th>
                    <th className="px-3 py-2.5 font-semibold">Role</th>
                    <th className="px-3 py-2.5 font-semibold">Submitted</th>
                    <th className="px-3 py-2.5 font-semibold">Documents</th>
                    <th className="px-3 py-2.5 font-semibold">Status</th>
                    <th className="py-2.5 pr-5 pl-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-3">
                          <AppAvatar
                            src={row.user.profile_pic ?? undefined}
                            fallback={personName(row.user)}
                            className="h-9 w-9"
                          />
                          <span className="text-ink font-semibold">
                            {personName(row.user)}
                          </span>
                        </span>
                      </td>
                      <td className="text-muted-foreground px-3 py-3">
                        {driverTypeLabel(row.user.driver_profile?.driver_type)}
                      </td>
                      <td className="text-muted-foreground px-3 py-3">
                        {row.submitted_at ? formatDate(row.submitted_at) : "-"}
                      </td>
                      <td className="text-muted-foreground px-3 py-3">
                        {documentsSummary(row)}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge
                          label={statusLabel(row.status)}
                          className={statusBadgeClass(row.status)}
                        />
                      </td>
                      <td className="py-3 pr-5 pl-2 text-right">
                        <Button
                          asChild
                          variant={
                            row.status === "PENDING" ? "default" : "outline"
                          }
                          className="h-8 rounded-lg px-3 text-xs"
                        >
                          <Link
                            href={`/admin/dashboard/drivers/${row.userId}?tab=documents`}
                          >
                            Review
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 px-4 pb-1 md:hidden">
              {rows.map((row) => (
                <Link
                  key={row.id}
                  href={`/admin/dashboard/drivers/${row.userId}?tab=documents`}
                  className="border-border block rounded-xl border p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-3">
                      <AppAvatar
                        src={row.user.profile_pic ?? undefined}
                        fallback={personName(row.user)}
                        className="h-9 w-9"
                      />
                      <span className="truncate text-sm font-semibold">
                        {personName(row.user)}
                      </span>
                    </span>
                    <StatusBadge
                      label={statusLabel(row.status)}
                      className={statusBadgeClass(row.status)}
                    />
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs">
                    {driverTypeLabel(row.user.driver_profile?.driver_type)} ·
                    submitted{" "}
                    {row.submitted_at ? formatDate(row.submitted_at) : "-"} ·{" "}
                    {documentsSummary(row)}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </Pagination>
    </div>
  );
};
