"use client";

import { AppAvatar } from "@/components/shared/app-avatar";
import { AppInput } from "@/components/shared/app-input";
import { AppSimpleSelect } from "@/components/shared/app-simple-select";
import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { TrustRing } from "@/components/drivers/trust-ring";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetData } from "@/hooks/use-get-data";
import {
  ADMIN_CARD,
  ADMIN_TABLE_HEAD,
  downloadCsv,
  personName,
  statusBadgeClass,
  statusLabel,
} from "@/lib/admin";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn, driverTypeLabel, formatDate } from "@/lib/utils";
import { BadgeCheck, Car, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { APIResponse, PaginatedResponse } from "@/types/response";
import type { AdminDriverStats, AdminUserRow } from "@/types/admin";
import { PageHeader } from "../../_components/page-header";
import { VerificationQueue } from "./_components/verification-queue";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "DEACTIVATED", label: "Deactivated" },
];

const verificationOf = (row: AdminUserRow) =>
  row.driver_profile?.verification_status ?? "UNSUBMITTED";

export default function AdminDrivers() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data: statsData } = useGetData<APIResponse<AdminDriverStats>>({
    url: API_ENDPOINTS.adminUsers.stats("DRIVER"),
  });

  const { data, isFetching } = useGetData<PaginatedResponse<AdminUserRow>>({
    url: API_ENDPOINTS.adminUsers.list({
      page,
      limit: 10,
      role: "DRIVER",
      status: status === "ALL" ? undefined : status,
      search: debouncedSearch || undefined,
    }),
  });

  const stats = statsData?.data;
  const rows = data?.data ?? [];

  const exportRows = (format: string) => {
    if (format !== "csv") return window.print();

    downloadCsv(
      "drivers.csv",
      ["Name", "Email", "Role", "Date applied", "Trust score", "Status"],
      rows.map((row) => [
        personName(row),
        row.email,
        driverTypeLabel(row.driver_profile?.driver_type),
        formatDate(row.createdAt),
        row.driver_profile?.trust_score ?? 0,
        verificationOf(row),
      ]),
    );
  };

  return (
    <div className="mx-auto max-w-[1360px] space-y-5 lg:space-y-6">
      <PageHeader
        title="Drivers"
        description="Applicants and active drivers. Open a profile to review documents and verification."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:gap-4">
        <StatCard
          icon={Car}
          label="All drivers"
          value={stats ? String(stats.total) : "-"}
          caption="Every driver account"
          captionTone="muted"
        />
        <StatCard
          icon={BadgeCheck}
          tone="green"
          label="Active drivers"
          value={stats ? String(stats.active) : "-"}
          caption="Verified and discoverable"
          captionTone="muted"
        />
        <StatCard
          icon={ShieldCheck}
          tone="amber"
          label="Pending approval"
          value={stats ? String(stats.pending_approval) : "-"}
          caption={
            stats && stats.pending_approval > 0
              ? "Awaiting review"
              : "All clear"
          }
          captionTone={
            stats && stats.pending_approval > 0 ? "warning" : "muted"
          }
          href="#verification"
        />
      </div>

      <div id="verification" className="scroll-mt-24">
        <VerificationQueue />
      </div>

      <div className={cn(ADMIN_CARD, "overflow-hidden")}>
        <div className="flex flex-wrap items-center gap-2 px-4 pt-4 pb-3 md:px-5 md:pt-5">
          <AppText type="h4" className="mr-auto text-[15px] font-semibold">
            All drivers
          </AppText>
          <AppInput
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search drivers..."
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
            containerClassName="w-[150px]"
          />
          <AppSimpleSelect
            placeholder="Export as"
            options={[
              { value: "pdf", label: "PDF" },
              { value: "csv", label: "CSV" },
            ]}
            onValueChange={exportRows}
            containerClassName="w-[130px]"
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
              title="No drivers found"
              description="Try a different search or status filter."
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={ADMIN_TABLE_HEAD}>
                      <th className="px-5 py-2.5 font-semibold">Applicant</th>
                      <th className="px-3 py-2.5 font-semibold">Role</th>
                      <th className="px-3 py-2.5 font-semibold">
                        Date applied
                      </th>
                      <th className="px-3 py-2.5 font-semibold">Trust</th>
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
                              src={row.profile_pic ?? undefined}
                              fallback={personName(row)}
                              className="h-9 w-9"
                            />
                            <span className="min-w-0">
                              <span className="text-ink block font-semibold">
                                {personName(row)}
                              </span>
                              <span className="text-muted-foreground block truncate text-xs">
                                {row.email}
                              </span>
                            </span>
                          </span>
                        </td>
                        <td className="text-muted-foreground px-3 py-3">
                          {driverTypeLabel(row.driver_profile?.driver_type)}
                        </td>
                        <td className="text-muted-foreground px-3 py-3">
                          {formatDate(row.createdAt)}
                        </td>
                        <td className="px-3 py-3">
                          <TrustRing
                            score={row.driver_profile?.trust_score ?? 0}
                            size={36}
                            label={null}
                            valueClassName="text-[11px]"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge
                            label={statusLabel(verificationOf(row))}
                            className={statusBadgeClass(verificationOf(row))}
                          />
                        </td>
                        <td className="py-3 pr-5 pl-2 text-right">
                          <Button
                            asChild
                            variant="outline"
                            className="h-8 rounded-lg px-3 text-xs"
                          >
                            <Link href={`/admin/dashboard/drivers/${row.id}`}>
                              View
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
                    href={`/admin/dashboard/drivers/${row.id}`}
                    className="border-border block rounded-xl border p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-3">
                        <AppAvatar
                          src={row.profile_pic ?? undefined}
                          fallback={personName(row)}
                          className="h-9 w-9"
                        />
                        <span className="truncate text-sm font-semibold">
                          {personName(row)}
                        </span>
                      </span>
                      <StatusBadge
                        label={statusLabel(verificationOf(row))}
                        className={statusBadgeClass(verificationOf(row))}
                      />
                    </div>
                    <p className="text-muted-foreground mt-2 text-xs">
                      {driverTypeLabel(row.driver_profile?.driver_type)} ·
                      joined {formatDate(row.createdAt)} · trust{" "}
                      {row.driver_profile?.trust_score ?? 0}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          )}
        </Pagination>
      </div>
    </div>
  );
}
