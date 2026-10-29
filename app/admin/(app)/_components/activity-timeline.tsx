"use client";

import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDateTime } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import type { PaginatedResponse } from "@/types/response";
import type { AdminActivityRow } from "@/types/admin";

interface Props {
  userId: string;
}

export const ActivityTimeline = function ({ userId }: Props) {
  const [page, setPage] = useState(1);

  const { data, isFetching } = useGetData<PaginatedResponse<AdminActivityRow>>({
    url: API_ENDPOINTS.adminUsers.activities(userId, { page, limit: 15 }),
  });

  const activities = data?.data ?? [];

  return (
    <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
      <Pagination
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        total={data?.total}
        isLoading={isFetching}
      >
        {!activities.length ? (
          <EmptyState
            title="No activity yet"
            description="Everything this account does is recorded here."
          />
        ) : (
          <ol className="relative space-y-6 pl-1">
            {activities.map((activity) => (
              <li key={activity.id} className="flex gap-3">
                <CheckCircle2 className="text-brand mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <AppText type="caption" className="block font-semibold">
                    {activity.title}
                  </AppText>
                  {activity.description && (
                    <AppText
                      type="caption"
                      className="text-muted-foreground block"
                    >
                      {activity.description}
                    </AppText>
                  )}
                  <AppText
                    type="caption"
                    className="text-muted-foreground mt-0.5 block text-xs"
                  >
                    {formatDateTime(activity.createdAt)}
                  </AppText>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Pagination>
    </div>
  );
};
