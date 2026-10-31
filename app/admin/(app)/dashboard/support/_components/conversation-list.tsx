"use client";

import { AppText } from "@/components/shared/app-text";
import { Skeleton } from "@/components/ui/skeleton";
import { personName } from "@/lib/admin";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Conversation } from "@/types/chat";

interface Props {
  conversations: Conversation[];
  isFetching: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const STATUS_STYLES: Record<Conversation["status"], string> = {
  WAITING: "bg-amber-50 text-amber-600",
  ACTIVE: "bg-emerald-50 text-emerald-600",
  RESOLVED: "bg-muted text-muted-foreground",
};

// ACTIVE with nobody but the requester = escalated past the AI, unclaimed.
const needsAgent = (conversation: Conversation) =>
  conversation.status === "ACTIVE" && conversation.participants.length < 2;

export const ConversationList = function ({
  conversations,
  isFetching,
  selectedId,
  onSelect,
}: Props) {
  return (
    <div className="border-border max-h-[70vh] overflow-y-auto rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      {isFetching && !conversations.length ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : !conversations.length ? (
        <AppText
          type="caption"
          className="text-muted-foreground block p-6 text-center text-sm"
        >
          No conversations yet.
        </AppText>
      ) : (
        <ul className="divide-border divide-y">
          {conversations.map((conversation) => {
            const requester = conversation.initiatedBy;

            return (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  className={cn(
                    "w-full cursor-pointer px-4 py-3 text-left transition-colors",
                    conversation.id === selectedId
                      ? "bg-brand-soft/50"
                      : "hover:bg-muted/50",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <AppText
                      type="label"
                      className="truncate text-sm font-semibold"
                    >
                      {requester ? personName(requester) : "User"}
                    </AppText>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                        needsAgent(conversation)
                          ? "bg-red-50 text-red-600"
                          : STATUS_STYLES[conversation.status],
                      )}
                    >
                      {needsAgent(conversation)
                        ? "needs agent"
                        : conversation.status.toLowerCase()}
                    </span>
                  </span>

                  <span className="mt-1 flex items-center justify-between gap-2">
                    <AppText
                      type="caption"
                      className="text-muted-foreground truncate text-xs"
                    >
                      {conversation.last_message ?? "No messages yet"}
                    </AppText>
                    <AppText
                      type="caption"
                      className="text-muted-foreground shrink-0 text-[10px]"
                    >
                      {formatRelativeTime(conversation.last_updated)}
                    </AppText>
                  </span>

                  <AppText
                    type="caption"
                    className="text-muted-foreground mt-0.5 block text-[10px] tracking-wide uppercase"
                  >
                    {requester?.role.toLowerCase()}
                  </AppText>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
