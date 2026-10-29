"use client";

import { AppTabs } from "@/components/shared/app-tabs";
import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { HireRequestRow } from "@/components/hires/hire-request-row";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { BriefcaseBusiness, FileClock, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { PaginatedResponse } from "@/types/response";
import type { HireRequest } from "@/types/hire";
import { HiredStaffTable } from "../_components/hired-staff-table";
import { useHires } from "./_hooks/use-hires";

type Tab = "hires" | "requests";

const TABS: { value: Tab; label: string }[] = [
  { value: "hires", label: "Active hires" },
  { value: "requests", label: "Hire requests" },
];

export default function MyHire() {
  const [tab, setTab] = useState<Tab>("hires");
  const [page, setPage] = useState(1);
  const [requestsPage, setRequestsPage] = useState(1);

  const { hires, total, totalPages, isFetching } = useHires({ page });

  const { data: requestsData, isFetching: isFetchingRequests } = useGetData<
    PaginatedResponse<HireRequest>
  >({
    url: API_ENDPOINTS.hireRequests.list({ page: requestsPage, limit: 10 }),
    shouldFetch: tab === "requests",
  });

  const requests = requestsData?.data ?? [];

  return (
    <div className="mx-auto max-w-[1360px] space-y-5">
      <PageHeader
        title="My hire"
        subtitle="Keep track of the drivers and staff you've brought on board."
        action={
          <Button asChild className="h-10 rounded-xl px-4 text-sm">
            <Link href="/dashboard/my-hire/request">
              <Plus className="h-4 w-4" />
              Request a driver
            </Link>
          </Button>
        }
      />

      <AppTabs
        variant="pill"
        tabs={TABS}
        value={tab}
        onValueChange={(value) => setTab(value as Tab)}
      />

      {tab === "hires" ? (
        <div className="border-border overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="px-4 pt-4 pb-3 md:px-5 md:pt-5">
            <AppText type="h3" className="text-[15px] font-semibold">
              Your hired staff
            </AppText>
            <AppText type="caption" className="text-muted-foreground block">
              Every driver working for you, with their trust score
            </AppText>
          </div>

          {isFetching && !hires.length ? (
            <div className="space-y-3 p-4 md:p-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : hires.length === 0 ? (
            <EmptyState
              icon={BriefcaseBusiness}
              title="No active hires yet"
              description="Drivers appear here once the invoice for their hire request is paid."
            />
          ) : (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              onPageChange={setPage}
              isLoading={isFetching}
              controlsClassName="px-4 md:px-5"
            >
              <HiredStaffTable hires={hires} />
            </Pagination>
          )}
        </div>
      ) : (
        <div className="border-border rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-6">
          <AppText type="h3" className="text-[15px] font-semibold">
            Your hire requests
          </AppText>
          <AppText
            type="caption"
            className="text-muted-foreground mt-1 block text-xs"
          >
            Each request is reviewed by our team, invoiced, and unlocked once
            paid.
          </AppText>

          {isFetchingRequests && !requests.length ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <EmptyState
              icon={FileClock}
              title="No hire requests yet"
              description="Request a driver from the marketplace and track it here."
              className="mt-4"
            />
          ) : (
            <Pagination
              page={requestsPage}
              totalPages={requestsData?.totalPages ?? 1}
              total={requestsData?.total ?? 0}
              onPageChange={setRequestsPage}
              isLoading={isFetchingRequests}
            >
              <div className="divide-y">
                {requests.map((request) => (
                  <HireRequestRow key={request.id} request={request} />
                ))}
              </div>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}
