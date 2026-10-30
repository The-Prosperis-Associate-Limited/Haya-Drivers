"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { BookOpen, Plus, XCircle } from "lucide-react";
import { useState } from "react";
import { CreateRequestDialog } from "./_components/create-request-dialog";
import { RequestCard } from "./_components/request-card";
import type { PaginatedResponse } from "@/types/response";
import type { StaffingRequestListItem } from "@/types/request";

const PAGE_SIZE = 6;

export default function Requests() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [closing, setClosing] = useState<StaffingRequestListItem | null>(null);

  const listUrl = API_ENDPOINTS.requests.list({ page, limit: PAGE_SIZE });

  const { data, isFetching } = useGetData<
    PaginatedResponse<StaffingRequestListItem>
  >({ url: listUrl });

  const requests = data?.data ?? [];

  const { mutate: closeRequest } = useSubmitData<string>({
    url: (reference) => API_ENDPOINTS.requests.close(reference),
    method: "patch",
    getBody: () => ({}),
    onSuccessMessage: "Request closed",
  });

  return (
    <div className="mx-auto max-w-[1360px]">
      <PageHeader
        title="My requests"
        subtitle="Every staffing request you have posted, with its matched drivers."
        action={
          <Button
            className="h-10 rounded-lg px-5 text-sm"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Request
          </Button>
        }
      />

      {isFetching && !requests.length ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[260px] rounded-2xl" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No requests yet"
          description="Post what you need and verified drivers who match will apply."
          className="mt-10"
          action={
            <Button
              className="h-10 rounded-lg px-5 text-sm"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Post a request
            </Button>
          }
        />
      ) : (
        <Pagination
          page={page}
          totalPages={data?.totalPages ?? 1}
          total={data?.total ?? 0}
          onPageChange={setPage}
          isLoading={isFetching}
        >
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onCloseRequest={setClosing}
              />
            ))}
          </div>
        </Pagination>
      )}

      <CreateRequestDialog isOpen={createOpen} onOpenChange={setCreateOpen} />

      <ConfirmDialog
        isOpen={closing !== null}
        onOpenChange={(open) => {
          if (!open) setClosing(null);
        }}
        icon={XCircle}
        iconClassName="text-destructive"
        title="Close this request?"
        description={`Drivers will no longer see "${closing?.title}" or apply to it. This can't be undone.`}
        confirmLabel="Close request"
        confirmVariant="destructive"
        onConfirm={() => {
          if (closing) closeRequest(closing.reference);
          setClosing(null);
        }}
      />
    </div>
  );
}
