"use client";

import { AppAvatar } from "@/components/shared/app-avatar";
import { AppInput } from "@/components/shared/app-input";
import { AppSimpleSelect } from "@/components/shared/app-simple-select";
import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetData } from "@/hooks/use-get-data";
import {
  ADMIN_CARD,
  ADMIN_TABLE_HEAD,
  clientName,
  downloadCsv,
  statusBadgeClass,
  statusLabel,
} from "@/lib/admin";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn, formatDate } from "@/lib/utils";
import { Ban, Building2, UserCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { APIResponse, PaginatedResponse } from "@/types/response";
import type { AdminClientStats, AdminUserRow } from "@/types/admin";
import { PageHeader } from "@/components/shared/page-header";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "DEACTIVATED", label: "Deactivated" },
];

const isOrganisation = (row: AdminUserRow) =>
  row.client_profile?.client_type === "ORGANISATION";

export default function AdminClients() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data: statsData } = useGetData<APIResponse<AdminClientStats>>({
    url: API_ENDPOINTS.adminUsers.stats("CLIENT"),
  });

  const { data, isFetching } = useGetData<PaginatedResponse<AdminUserRow>>({
    url: API_ENDPOINTS.adminUsers.list({
      page,
      limit: 10,
      role: "CLIENT",
      status: status === "ALL" ? undefined : status,
      search: debouncedSearch || undefined,
    }),
  });

  const stats = statsData?.data;
  const rows = data?.data ?? [];

  const exportRows = (format: string) => {
    if (format !== "csv") return window.print();

    downloadCsv(
      "clients.csv",
      ["Client", "Type", "Contact", "Registered", "Status"],
      rows.map((row) => [
        clientName(row),
        isOrganisation(row) ? "Organization" : "Individual",
        row.email,
        formatDate(row.createdAt),
        row.account_status,
      ]),
    );
  };

  return (
    <div className="mx-auto max-w-[1360px] space-y-5 lg:space-y-6">
      <PageHeader
        className="mb-0"
        title="Clients"
        subtitle="Individual and organization clients hiring drivers on Haya Drivers."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:gap-4">
        <StatCard
          icon={Building2}
          label="All clients"
          value={stats ? String(stats.total) : "-"}
          caption={stats ? `${stats.organisations} organizations` : " "}
          captionTone="muted"
        />
        <StatCard
          icon={UserCheck}
          tone="green"
          label="Active clients"
          value={stats ? String(stats.active) : "-"}
          caption="Accounts in good standing"
          captionTone="muted"
        />
        <StatCard
          icon={Ban}
          tone="amber"
          label="Suspended"
          value={stats ? String(stats.suspended) : "-"}
          caption={
            stats && stats.suspended > 0 ? "Access revoked" : "All clear"
          }
          captionTone={stats && stats.suspended > 0 ? "warning" : "muted"}
        />
      </div>

      <div className={cn(ADMIN_CARD, "overflow-hidden")}>
        <div className="flex flex-wrap items-center gap-2 px-4 pt-4 pb-3 md:px-5 md:pt-5">
          <AppText type="h4" className="mr-auto text-[15px] font-semibold">
            All clients
          </AppText>
          <AppInput
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search clients..."
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
              title="No clients found"
              description="Try a different search or status filter."
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={ADMIN_TABLE_HEAD}>
                      <th className="px-5 py-2.5 font-semibold">Client</th>
                      <th className="px-3 py-2.5 font-semibold">Type</th>
                      <th className="px-3 py-2.5 font-semibold">Contact</th>
                      <th className="px-3 py-2.5 font-semibold">Registered</th>
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
                              fallback={clientName(row)}
                              className="h-9 w-9"
                            />
                            <span className="text-ink font-semibold">
                              {clientName(row)}
                            </span>
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge
                            label={
                              isOrganisation(row)
                                ? "Organization"
                                : "Individual"
                            }
                            className={
                              isOrganisation(row)
                                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                                : "border-slate-200 bg-slate-50 text-slate-600"
                            }
                          />
                        </td>
                        <td className="text-muted-foreground px-3 py-3">
                          {row.email}
                        </td>
                        <td className="text-muted-foreground px-3 py-3">
                          {formatDate(row.createdAt)}
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge
                            label={statusLabel(row.account_status)}
                            className={statusBadgeClass(row.account_status)}
                          />
                        </td>
                        <td className="py-3 pr-5 pl-2 text-right">
                          <Button
                            asChild
                            variant="outline"
                            className="h-8 rounded-lg px-3 text-xs"
                          >
                            <Link href={`/admin/dashboard/clients/${row.id}`}>
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
                    href={`/admin/dashboard/clients/${row.id}`}
                    className="border-border block rounded-xl border p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-3">
                        <AppAvatar
                          src={row.profile_pic ?? undefined}
                          fallback={clientName(row)}
                          className="h-9 w-9"
                        />
                        <span className="truncate text-sm font-semibold">
                          {clientName(row)}
                        </span>
                      </span>
                      <StatusBadge
                        label={statusLabel(row.account_status)}
                        className={statusBadgeClass(row.account_status)}
                      />
                    </div>
                    <p className="text-muted-foreground mt-2 text-xs">
                      {isOrganisation(row) ? "Organization" : "Individual"} ·{" "}
                      {row.email} · joined {formatDate(row.createdAt)}
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
