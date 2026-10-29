"use client";

import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn } from "@/lib/utils";
import { ReceiptText, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import type { HireRequest, HireRequestStatus } from "@/types/hire";
import { HireRequestCard } from "./_components/hire-request-card";
import { PricingGuideDialog } from "./_components/pricing-guide-dialog";

type Filter = "ALL" | HireRequestStatus;

interface InboxPayload {
  message: string;
  data: HireRequest[];
  total: number;
  page: number;
  totalPages: number;
  counts: Partial<Record<HireRequestStatus, number>>;
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING_REVIEW", label: "Pending review" },
  { value: "INVOICED", label: "Invoiced" },
  { value: "PAYMENT_REVIEW", label: "Payment review" },
  { value: "PAID", label: "Paid" },
  { value: "DECLINED", label: "Declined" },
  { value: "CANCELLED", label: "Cancelled" },
];

const AdminHiresContent = function () {
  const router = useRouter();
  const q = useSearchParams().get("q") ?? undefined;
  const [filter, setFilter] = useState<Filter>("ALL");
  const [page, setPage] = useState(1);

  const listUrl = API_ENDPOINTS.adminHires.list({
    page,
    limit: 10,
    ...(filter !== "ALL" && { status: filter }),
    q,
  });

  const { data, isFetching } = useGetData<InboxPayload>({
    url: listUrl,
  });

  const payload = data;
  const requests = payload?.data ?? [];
  const counts = payload?.counts ?? {};

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <AppText type="h2" className="text-xl font-bold md:text-2xl">
            Hire requests
          </AppText>
          <AppText type="subtitle" className="text-muted-foreground text-sm">
            Review each request, generate the invoice, and the client's payment
            unlocks the driver's details.
          </AppText>
        </div>
        <PricingGuideDialog />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((entry) => (
          <button
            key={entry.value}
            type="button"
            onClick={() => {
              setFilter(entry.value);
              setPage(1);
            }}
            className={cn(
              "cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              filter === entry.value
                ? "bg-brand text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/70",
            )}
          >
            {entry.label}
            {entry.value !== "ALL" && counts[entry.value] != null && (
              <span className="ml-1.5 opacity-70">{counts[entry.value]}</span>
            )}
          </button>
        ))}
      </div>

      {q && (
        <div className="bg-brand-soft text-brand flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm">
          <span className="min-w-0 truncate">
            Showing matches for <strong>{q}</strong>
          </span>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold"
            onClick={() => {
              setPage(1);
              router.replace("/admin/dashboard/hires");
            }}
          >
            <X className="size-3.5" />
            Clear
          </button>
        </div>
      )}

      {isFetching && !requests.length ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No hire requests"
          description="Client hire requests land here for review and invoicing."
        />
      ) : (
        <Pagination
          page={page}
          totalPages={payload?.totalPages ?? 1}
          total={payload?.total ?? 0}
          onPageChange={setPage}
          isLoading={isFetching}
        >
          <div className="space-y-3">
            {requests.map((request) => (
              <HireRequestCard
                key={request.id}
                request={request}
                listUrl={listUrl}
              />
            ))}
          </div>
        </Pagination>
      )}
    </div>
  );
};

export default function AdminHires() {
  return (
    <Suspense fallback={null}>
      <AdminHiresContent />
    </Suspense>
  );
}
