"use client";

import { useEffect, useRef, useState } from "react";
import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { useGetProfile } from "@/hooks/use-get-profile";
import { getChatSocket } from "@/lib/chat-socket";
import { API_ENDPOINTS } from "@/lib/endpoints";
import api from "@/lib/api";
import { personName } from "@/lib/admin";
import { cn, formatTime } from "@/lib/utils";
import { CheckCheck, SendHorizonal, UserPlus } from "lucide-react";
import type { APIResponse } from "@/types/response";
import type { AdminConversationPayload, ChatMessage } from "@/types/chat";

interface Props {
  conversationId: string;
  onChanged: () => void;
}

export const TranscriptPane = function ({ conversationId, onChanged }: Props) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { profile } = useGetProfile();

  const detailUrl = API_ENDPOINTS.adminChat.get(conversationId);
  const { data, isFetching, refetch } = useGetData<
    APIResponse<AdminConversationPayload>
  >({ url: detailUrl });

  const conversation = data?.data.conversation;
  const messages = conversation?.messages ?? [];

  // Live echoes for this thread - a refetch keeps ordering server-authoritative.
  useEffect(() => {
    const socket = getChatSocket();
    if (!socket) return;

    const onMessage = (payload: { conversationId: string }) => {
      if (payload.conversationId === conversationId) refetch();
    };

    socket.on("new-message", onMessage);
    socket.on("chat-resolved", onMessage);
    socket.on("connect", refetch);

    return () => {
      socket.off("new-message", onMessage);
      socket.off("chat-resolved", onMessage);
      socket.off("connect", refetch);
    };
  }, [conversationId, refetch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Reading the thread clears this admin's unread marker.
  useEffect(() => {
    if ((data?.data.unread ?? 0) > 0) {
      api
        .post(API_ENDPOINTS.adminChat.read(conversationId), {})
        .catch(() => {});
    }
  }, [conversationId, data?.data.unread]);

  const isParticipant =
    !!profile &&
    !!conversation?.participants.some((entry) => entry.userId === profile.id);
  const resolved = conversation?.status === "RESOLVED";

  const { mutate: join, isPending: isJoining } = useSubmitData({
    url: API_ENDPOINTS.adminChat.join(conversationId),
    onSuccessMessage: "You joined the conversation",
    onSuccess: onChanged,
  });

  const { mutate: resolve, isPending: isResolving } = useSubmitData({
    url: API_ENDPOINTS.adminChat.resolve(conversationId),
    onSuccessMessage: "Conversation resolved",
    onSuccess: onChanged,
  });

  const { mutate: reply, isPending: isSending } = useSubmitData<{
    message: string;
  }>({
    url: API_ENDPOINTS.adminChat.message(conversationId),
    silent: true,
  });

  const send = () => {
    const message = draft.trim();
    if (!message) return;
    reply({ message });
    setDraft("");
  };

  const requester = conversation?.initiatedBy;

  return (
    <div className="border-border flex max-h-[70vh] min-h-[420px] flex-col rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="border-border flex items-center justify-between gap-3 border-b px-5 py-4">
        <div className="min-w-0">
          <AppText type="label" className="block truncate text-sm font-bold">
            {requester ? personName(requester) : "Conversation"}
          </AppText>
          <AppText
            type="caption"
            className="text-muted-foreground block truncate text-xs"
          >
            {requester?.email} · {requester?.role.toLowerCase()}
          </AppText>
        </div>

        <div className="flex shrink-0 gap-2">
          {!isParticipant && !resolved && (
            <Button
              onClick={() => join({})}
              isLoading={isJoining}
              className="h-9 rounded-lg px-4 text-xs"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Join chat
            </Button>
          )}
          {!resolved && (
            <Button
              variant="outline"
              onClick={() => resolve({})}
              isLoading={isResolving}
              className="h-9 rounded-lg px-4 text-xs"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Resolve
            </Button>
          )}
        </div>
      </div>

      <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {isFetching && !messages.length ? (
          <Skeleton className="h-16 w-3/4 rounded-xl" />
        ) : (
          messages.map((message: ChatMessage) => {
            if (message.is_system) {
              return (
                <AppText
                  key={message.id}
                  type="caption"
                  className="text-muted-foreground block text-center text-xs"
                >
                  {message.message}
                </AppText>
              );
            }

            const fromAdmin = message.sender?.role === "ADMIN";
            const fromAi = message.is_from_ai;

            return (
              <div
                key={message.id}
                className={cn(
                  "max-w-[80%] rounded-xl px-4 py-2.5",
                  fromAdmin ? "bg-brand ml-auto" : "bg-gray-100",
                  fromAi && "border-brand/20 bg-brand-soft/40 ml-auto border",
                )}
              >
                <AppText
                  type="caption"
                  className={cn(
                    "block text-xs font-semibold",
                    fromAdmin ? "text-white/80" : "text-brand",
                  )}
                >
                  {fromAi
                    ? "Haya · AI assistant"
                    : message.sender
                      ? personName(message.sender)
                      : "User"}
                </AppText>
                <AppText
                  type="caption"
                  className={cn(
                    "block",
                    fromAdmin ? "text-white" : "text-foreground",
                  )}
                >
                  {message.message}
                </AppText>
                <AppText
                  type="caption"
                  className={cn(
                    "mt-0.5 block text-[10px]",
                    fromAdmin ? "text-white/60" : "text-muted-foreground",
                  )}
                >
                  {formatTime(message.sent_at)}
                </AppText>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {resolved ? (
        <AppText
          type="caption"
          className="text-muted-foreground border-border block border-t px-5 py-4 text-center text-xs"
        >
          This conversation is resolved.
        </AppText>
      ) : isParticipant ? (
        <div className="border-border flex items-end gap-2 border-t p-4">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            placeholder="Reply to this conversation..."
            rows={1}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-full bg-gray-50 px-4 py-3"
          />
          <Button
            size="icon"
            aria-label="Send reply"
            disabled={!draft.trim()}
            isLoading={isSending}
            onClick={send}
            className="h-11 w-11 shrink-0 rounded-full"
          >
            <SendHorizonal className="h-4.5 w-4.5" />
          </Button>
        </div>
      ) : (
        <AppText
          type="caption"
          className="text-muted-foreground border-border block border-t px-5 py-4 text-center text-xs"
        >
          Join the chat to reply.
        </AppText>
      )}
    </div>
  );
};
