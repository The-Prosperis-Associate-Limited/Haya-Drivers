"use client";

import { AppTabs } from "@/components/shared/app-tabs";
import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate, formatMoney } from "@/lib/utils";
import type { AdminReferral } from "@/types/referral";
import type { PaginatedResponse } from "@/types/response";
import { ShieldAlert, UsersRound } from "lucide-react";
import { useState } from "react";
import { ReferralStatusChip } from "./referral-status-chip";

type Filter = "all" | "HELD" | "REWARDED" | "SIGNED_UP" | "REJECTED" | "REVERSED";

interface Props {
  heldCount: number;
  onReview: (id: string) => void;
  onSelectDriver: (userId: string) => void;
}

const rewardCell = (referral: AdminReferral) => {
  if (referral.status === "REWARDED") return <span className="font-semibold text-emerald-700">{formatMoney(referral.reward_minor, referral.currency)} paid</span>;
  if (referral.status === "REVERSED") return <span className="font-semibold text-red-600">Reversed</span>;
  if (referral.status === "HELD") return <span className="font-semibold text-violet-700">Awaiting review</span>;
  if (referral.status === "REJECTED") return <span className="text-muted-foreground">Refused</span>;
  return <span className="text-muted-foreground">Not yet</span>;
};

export const ReferralsTable = function ({ heldCount, onReview, onSelectDriver }: Props) {
  const [filter, setFilter] = useState<Filter>(heldCount ? "HELD" : "all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);

  const { data, isFetching } = useGetData<PaginatedResponse<AdminReferral>>({
    url: API_ENDPOINTS.adminReferrals.list({
      page,
      limit,
      status: filter === "all" ? undefined : filter,
      search: debounced || undefined,
    }),
  });

  const rows = data?.data ?? [];

  return (
    <section className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <AppText type="h4" className="text-[15px] font-semibold">
            All referrals
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            One row per referred driver. Open a row to see the abuse checks.
          </AppText>
        </div>
        <div className="max-w-full overflow-x-auto">
          <AppTabs
            variant="compact"
            value={filter}
            onValueChange={(value) => {
              setFilter(value);
              setPage(1);
            }}
            tabs={[
              { value: "all", label: "All" },
              { value: "HELD", label: heldCount ? `Held ${heldCount}` : "Held" },
              { value: "REWARDED", label: "Rewarded" },
              { value: "SIGNED_UP", label: "Onboarding" },
              { value: "REJECTED", label: "Refused" },
              { value: "REVERSED", label: "Reversed" },
            ]}
          />
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={(value) => {
          setLimit(value);
          setPage(1);
        }}
        total={data?.total}
        isLoading={isFetching}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search a driver, email or code…"
      >
        {isFetching && !rows.length ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : !rows.length ? (
          <EmptyState icon={UsersRound} title="No referrals here." description="Try another filter or search." />
        ) : (
          <>
            <div className="divide-border divide-y md:hidden">
              {rows.map((referral) => (
                <button type="button" key={referral.id} onClick={() => onReview(referral.id)} className="block w-full space-y-1.5 py-3 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13.5px] font-semibold">{referral.referee.name}</span>
                    <ReferralStatusChip status={referral.status} />
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Referred by {referral.referrer.name} · {formatDate(referral.created_at)}
                  </p>
                  <p className="text-xs">{rewardCell(referral)}</p>
                </button>
              ))}
            </div>

            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referred driver</TableHead>
                    <TableHead>Referred by</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Reward</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((referral) => (
                    <TableRow key={referral.id} onClick={() => onReview(referral.id)} className="cursor-pointer">
                      <TableCell>
                        <span className="flex items-center gap-2">
                          <span className="min-w-0">
                            <span className="block truncate font-semibold">{referral.referee.name}</span>
                            <span className="text-muted-foreground block truncate text-xs">{referral.referee.location ?? referral.referee.email}</span>
                          </span>
                          {!!referral.risk_flags.length && <ShieldAlert className="size-4 shrink-0 text-amber-600" aria-label={`${referral.risk_flags.length} abuse flags`} />}
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onSelectDriver(referral.referrer.id);
                          }}
                          className="text-brand font-semibold hover:underline"
                        >
                          {referral.referrer.name}
                        </button>
                      </TableCell>
                      <TableCell>
                        <span className="border-border rounded-full border px-2 py-0.5 text-xs">{referral.code}</span>
                      </TableCell>
                      <TableCell>
                        <ReferralStatusChip status={referral.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(referral.created_at)}</TableCell>
                      <TableCell className="text-right text-[13px]">{rewardCell(referral)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </Pagination>
    </section>
  );
};
