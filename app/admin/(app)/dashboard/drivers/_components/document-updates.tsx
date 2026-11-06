"use client";

import { AppAvatar } from "@/components/shared/app-avatar";
import { AppText } from "@/components/shared/app-text";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { ADMIN_CARD, personName } from "@/lib/admin";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn, formatDate } from "@/lib/utils";
import { FileCheck2, Megaphone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { APIResponse } from "@/types/response";
import type { AdminDocumentUpdate } from "@/types/admin";

export const DocumentUpdates = function () {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data } = useGetData<APIResponse<AdminDocumentUpdate[]>>({
    url: API_ENDPOINTS.adminVerifications.documentUpdates,
  });

  const { data: noticeData } = useGetData<APIResponse<{ pending: number }>>({
    url: API_ENDPOINTS.adminVerifications.requiredDocumentsNotice,
  });

  const { mutate: sendNotice, isPending: isSending } = useSubmitData({
    url: API_ENDPOINTS.adminVerifications.requiredDocumentsNotice,
    method: "post",
    onSuccess: () => setConfirmOpen(false),
  });

  const updates = data?.data ?? [];
  const pendingNotice = noticeData?.data.pending ?? 0;

  return (
    <div className={cn(ADMIN_CARD, "p-4 md:p-5")}>
      <div className="flex flex-wrap items-start gap-3">
        <div className="mr-auto min-w-0">
          <AppText type="h4" className="text-[15px] font-semibold">
            Document updates
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            New uploads from verified drivers - they stay verified while these
            wait
          </AppText>
        </div>
        {pendingNotice > 0 && (
          <Button
            variant="outline"
            className="h-10 rounded-xl"
            onClick={() => setConfirmOpen(true)}
          >
            <Megaphone className="size-4" />
            Notify {pendingNotice} driver{pendingNotice === 1 ? "" : "s"}
          </Button>
        )}
      </div>

      {!updates.length ? (
        <EmptyState
          size="compact"
          icon={FileCheck2}
          title="Nothing to review"
          description="Documents verified drivers add later show up here."
        />
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {updates.map((update) => (
            <li
              key={update.id}
              className="flex flex-wrap items-center gap-3 py-3 last:pb-0"
            >
              <AppAvatar
                src={update.driver.profile_pic ?? undefined}
                fallback={personName(update.driver)}
                className="h-9 w-9"
              />
              <span className="min-w-0 flex-1">
                <span className="text-ink block truncate text-sm font-semibold">
                  {personName(update.driver)}
                </span>
                <span className="text-muted-foreground block truncate text-xs">
                  {update.label} · uploaded {formatDate(update.updatedAt)}
                  {update.documents_due_at
                    ? ` · deadline ${formatDate(update.documents_due_at)}`
                    : ""}
                </span>
              </span>
              <Button asChild variant="outline" className="h-9 rounded-xl">
                <Link
                  href={`/admin/dashboard/drivers/${update.driver.id}?tab=documents`}
                >
                  Review
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        icon={Megaphone}
        title={`Email ${pendingNotice} driver${pendingNotice === 1 ? "" : "s"}?`}
        description="Every driver who has started verification but is missing a required document gets an email and an in-app notice naming what to upload. Verified drivers are told their deadline. Each driver is only ever sent this once."
        confirmLabel="Send notice"
        isLoading={isSending}
        onConfirm={() => sendNotice({})}
      />
    </div>
  );
};
