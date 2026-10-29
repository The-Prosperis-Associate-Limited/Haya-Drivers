"use client";

import { useEffect, useState } from "react";
import { AppText } from "@/components/shared/app-text";
import { useGetData } from "@/hooks/use-get-data";
import { getChatSocket } from "@/lib/chat-socket";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { APIResponse } from "@/types/response";
import type { ChatInbox } from "@/types/chat";
import { ConversationList } from "./_components/conversation-list";
import { TranscriptPane } from "./_components/transcript-pane";

export default function AdminSupportInbox() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isFetching, refetch } = useGetData<APIResponse<ChatInbox>>({
    url: API_ENDPOINTS.adminChat.list({ page: 1, limit: 50 }),
  });

  const conversations = data?.data.data ?? [];

  // The support pool broadcasts on every user message, claim and resolve -
  // refetching the inbox is enough to keep the list live.
  useEffect(() => {
    const socket = getChatSocket();
    if (!socket) return;

    const onPool = () => refetch();
    socket.on("support-notification", onPool);
    socket.on("new-message", onPool);

    return () => {
      socket.off("support-notification", onPool);
      socket.off("new-message", onPool);
    };
  }, [refetch]);

  const selected =
    conversations.find((entry) => entry.id === selectedId) ??
    conversations[0] ??
    null;

  return (
    <div className="mx-auto max-w-[1360px] space-y-6">
      <div>
        <AppText type="h2" className="text-[22px] font-semibold tracking-tight">
          Support inbox
        </AppText>
        <AppText type="subtitle" className="text-muted-foreground text-[13px]">
          Live conversations from drivers and clients. Join a chat to reply.
        </AppText>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
        <ConversationList
          conversations={conversations}
          isFetching={isFetching}
          selectedId={selected?.id ?? null}
          onSelect={setSelectedId}
        />

        {selected ? (
          <TranscriptPane
            key={selected.id}
            conversationId={selected.id}
            onChanged={refetch}
          />
        ) : (
          <div className="border-border text-muted-foreground flex min-h-[420px] items-center justify-center rounded-2xl border bg-white text-sm">
            {isFetching ? "Loading conversations…" : "No open conversations."}
          </div>
        )}
      </div>
    </div>
  );
}
