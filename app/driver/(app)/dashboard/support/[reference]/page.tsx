"use client";

import { AppText } from "@/components/shared/app-text";
import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCommentOnTicket, useTicket } from "@/hooks/use-tickets";
import { cn, formatDateTime } from "@/lib/utils";
import { SendHorizonal } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import type { TicketStatus } from "@/types/ticket";

const statusTones: Record<TicketStatus, string> = {
  OPEN: "bg-amber-50 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-gray-50 text-gray-600 border-gray-200",
};

export default function TicketThread() {
  const params = useParams<{ reference: string }>();
  const [draft, setDraft] = useState("");

  // The server sends the reference in notification action urls and the sheet
  // holds the id; /tickets/:id resolves either.
  const { ticket, isFetching } = useTicket(params.reference);
  const { sendMessage, isPending } = useCommentOnTicket(params.reference);

  if (isFetching && !ticket) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!ticket) return null;

  const send = () => {
    const message = draft.trim();

    if (!message) return;

    sendMessage({ message });
    setDraft("");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BackLink href="/driver/dashboard/support" label="Back to support" />

      <PageHeader
        title={ticket.subject}
        subtitle={`${ticket.reference} · ${formatDateTime(ticket.createdAt)}`}
        action={
          <StatusBadge
            label={ticket.status.toLowerCase().replace("_", " ")}
            className={statusTones[ticket.status]}
          />
        }
      />

      <div className="border-border space-y-4 rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
        <div className="max-w-[85%] rounded-xl bg-gray-100 px-4 py-3">
          <AppText type="caption" className="text-foreground block">
            {ticket.description}
          </AppText>
          <AppText type="caption" className="text-muted-foreground mt-1 block">
            {formatDateTime(ticket.createdAt)}
          </AppText>
        </div>

        {ticket.comments?.map((comment) => {
          const fromSupport = comment.author.role === "ADMIN";

          return (
            <div
              key={comment.id}
              className={cn(
                "max-w-[85%] rounded-xl px-4 py-3",
                fromSupport ? "bg-gray-100" : "bg-brand ml-auto",
              )}
            >
              <AppText
                type="caption"
                className={cn(
                  "block",
                  fromSupport ? "text-foreground" : "text-white",
                )}
              >
                {comment.message}
              </AppText>
              <AppText
                type="caption"
                className={cn(
                  "mt-1 block",
                  fromSupport ? "text-muted-foreground" : "text-white/70",
                )}
              >
                {formatDateTime(comment.createdAt)}
              </AppText>
            </div>
          );
        })}
      </div>

      <div className="flex items-end gap-2">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          placeholder="Reply to support..."
          rows={1}
          className="max-h-32 min-h-11 flex-1 resize-none rounded-xl bg-white px-4 py-3"
        />

        <Button
          size="icon"
          aria-label="Send reply"
          disabled={!draft.trim()}
          isLoading={isPending}
          onClick={send}
          className="h-11 w-11 shrink-0 rounded-full"
        >
          <SendHorizonal className="h-4.5 w-4.5" />
        </Button>
      </div>
    </div>
  );
}
