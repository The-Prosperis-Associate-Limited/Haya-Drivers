"use client";

import { AppAvatar } from "@/components/shared/app-avatar";
import {
  SalaryDetails,
  SalaryStatusBadge,
} from "@/components/salary/salary-payments";
import { AppTabs } from "@/components/shared/app-tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { ADMIN_CARD, ADMIN_TABLE_HEAD } from "@/lib/admin";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import { AlertTriangle, Banknote, Hourglass, Scale } from "lucide-react";
import { useState } from "react";
import type {
  AdminSalaryCounts,
  AdminSalaryFilter,
  SalaryPaymentWithParties,
} from "@/types/salary";
import { ResolveSalaryDialog } from "./_components/resolve-salary-dialog";

interface SalariesPayload {
  data: SalaryPaymentWithParties[];
  total: number;
  totalPages: number;
  counts: AdminSalaryCounts;
}

const EMPTY: Record<AdminSalaryFilter, { title: string; description: string }> =
  {
    disputed: {
      title: "No disputes",
      description:
        "When a driver reports a salary they didn't receive, it lands here.",
    },
    overdue: {
      title: "Nothing overdue",
      description:
        "Salaries still unpaid after the grace period show up here. Clients are reminded automatically.",
    },
    awaiting: {
      title: "Nothing waiting",
      description:
        "Salaries a client has marked as paid but the driver hasn't confirmed yet.",
    },
    all: {
      title: "No salary payments yet",
      description: "Pay periods open as brokered engagements start.",
    },
  };

const Party = function ({
  person,
}: {
  person: { name: string; profile_pic: string | null } | null;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <AppAvatar
        src={person?.profile_pic ?? undefined}
        fallback={person?.name ?? "-"}
        size="sm"
      />
      <span className="truncate">{person?.name ?? "-"}</span>
    </span>
  );
};

export default function AdminSalaries() {
  const [status, setStatus] = useState<AdminSalaryFilter>("disputed");
  const [page, setPage] = useState(1);
  const [resolving, setResolving] = useState<SalaryPaymentWithParties | null>(
    null,
  );

  const { data, isFetching } = useGetData<SalariesPayload>({
    url: API_ENDPOINTS.adminSalaries.list({ page, limit: 10, status }),
  });

  const rows = data?.data ?? [];
  const counts = data?.counts;
  const withCount = (label: string, count?: number) =>
    count ? `${label} · ${count}` : label;

  return (
    <div className="mx-auto max-w-[1360px] space-y-5 lg:space-y-6">
      <PageHeader
        className="mb-0"
        title="Salaries"
        subtitle="Clients pay drivers directly; this is the record of it. Settle disputes and keep an eye on what's overdue."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:gap-4">
        <StatCard
          icon={Scale}
          tone={counts?.disputed ? "red" : "brand"}
          label="Disputed"
          value={counts ? String(counts.disputed) : "-"}
          caption="Drivers who say they weren't paid"
          captionTone="muted"
        />
        <StatCard
          icon={AlertTriangle}
          tone="amber"
          label="Overdue"
          value={counts ? String(counts.overdue) : "-"}
          caption="Past the grace period - clients are reminded"
          captionTone="muted"
        />
        <StatCard
          icon={Hourglass}
          tone="violet"
          label="Awaiting the driver"
          value={counts ? String(counts.awaiting) : "-"}
          caption="Marked paid, not yet confirmed"
          captionTone="muted"
        />
      </div>

      <div className={cn(ADMIN_CARD, "overflow-hidden")}>
        <div className="px-4 pt-4 pb-3 md:px-5 md:pt-5">
          <AppTabs<AdminSalaryFilter>
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            variant="compact"
            tabs={[
              {
                value: "disputed",
                label: withCount("Disputed", counts?.disputed),
              },
              {
                value: "overdue",
                label: withCount("Overdue", counts?.overdue),
              },
              {
                value: "awaiting",
                label: withCount("Awaiting driver", counts?.awaiting),
              },
              { value: "all", label: "All" },
            ]}
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
          {isFetching && !rows.length ? (
            <div className="space-y-3 p-4 md:p-5">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : !rows.length ? (
            <EmptyState icon={Banknote} {...EMPTY[status]} />
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={ADMIN_TABLE_HEAD}>
                      <th className="px-5 py-2.5 font-semibold">Period</th>
                      <th className="px-3 py-2.5 font-semibold">Client</th>
                      <th className="px-3 py-2.5 font-semibold">Driver</th>
                      <th className="px-3 py-2.5 font-semibold">Due</th>
                      <th className="px-3 py-2.5 font-semibold">Amount</th>
                      <th className="px-3 py-2.5 font-semibold">Status</th>
                      <th className="py-2.5 pr-5 pl-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row) => (
                      <tr key={row.id} className="align-top">
                        <td className="px-5 py-3">
                          <span className="block font-medium">
                            {row.period_label}
                          </span>
                          <span className="text-muted-foreground block text-xs">
                            {row.booking.reference} ·{" "}
                            {row.booking.engagement_type === "CONTRACT"
                              ? "Contract"
                              : "Full-time"}
                          </span>
                          <div className="mt-1.5 max-w-sm">
                            <SalaryDetails payment={row} />
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <Party person={row.client} />
                        </td>
                        <td className="px-3 py-3">
                          <Party person={row.driver} />
                        </td>
                        <td className="text-muted-foreground px-3 py-3">
                          {formatDate(row.due_at)}
                        </td>
                        <td className="px-3 py-3 font-semibold">
                          {formatMoney(row.amount_minor, row.currency)}
                        </td>
                        <td className="px-3 py-3">
                          <SalaryStatusBadge payment={row} viewer="admin" />
                        </td>
                        <td className="py-3 pr-5 pl-2 text-right">
                          {row.status === "DISPUTED" && (
                            <Button
                              size="sm"
                              className="h-8 rounded-lg px-3 text-xs"
                              onClick={() => setResolving(row)}
                            >
                              Resolve
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {rows.map((row) => (
                  <div key={row.id} className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">
                          {row.period_label}
                        </span>
                        <span className="text-muted-foreground block text-xs">
                          {row.client.name} → {row.driver?.name ?? "Driver"}
                        </span>
                      </span>
                      <SalaryStatusBadge payment={row} viewer="admin" />
                    </div>
                    <p className="text-sm font-semibold">
                      {formatMoney(row.amount_minor, row.currency)}
                      <span className="text-muted-foreground ml-2 text-xs font-normal">
                        due {formatDate(row.due_at)} · {row.booking.reference}
                      </span>
                    </p>
                    <SalaryDetails payment={row} />
                    {row.status === "DISPUTED" && (
                      <Button
                        size="sm"
                        className="h-9 w-full rounded-lg text-xs"
                        onClick={() => setResolving(row)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </Pagination>
      </div>

      <ResolveSalaryDialog
        payment={resolving}
        onClose={() => setResolving(null)}
      />
    </div>
  );
}
