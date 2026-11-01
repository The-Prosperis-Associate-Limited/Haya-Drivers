"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getChatSocket } from "@/lib/chat-socket";
import { API_ENDPOINTS } from "@/lib/endpoints";
import api from "@/lib/api";
import { useGetData } from "./use-get-data";
import { useSubmitData } from "./use-submit-data";
import type { APIResponse } from "@/types/response";
import type { ChatMessage, ConversationPayload } from "@/types/chat";

export const useLiveChat = function (isOpen: boolean) {
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [resolved, setResolved] = useState(false);
  const seenIds = useRef(new Set<string>());

  const { data, isFetching, refetch } = useGetData<
    APIResponse<ConversationPayload>
  >({
    url: API_ENDPOINTS.chat.conversation,
    shouldFetch: isOpen,
  });

  const conversation = data?.data.conversation ?? null;
  const conversationId = conversation?.id ?? null;

  // A resolved thread stays resolved until the server hands us a new open one.
  const [syncedMessages, setSyncedMessages] = useState(conversation?.messages);
  if (syncedMessages !== conversation?.messages) {
    setSyncedMessages(conversation?.messages);
    setResolved(false);
    setLiveMessages([]);
  }

  useEffect(() => {
    seenIds.current = new Set(conversation?.messages.map((m) => m.id));
  }, [conversation?.messages]);

  useEffect(() => {
    if (!isOpen) return;

    const socket = getChatSocket();
    if (!socket) return;

    const onMessage = (payload: {
      conversationId: string;
      message: ChatMessage;
    }) => {
      if (conversationId && payload.conversationId !== conversationId) return;

      setLiveMessages((current) => {
        if (seenIds.current.has(payload.message.id)) return current;
        seenIds.current.add(payload.message.id);

        // Swap the optimistic copy of our own message in place.
        const optimisticIndex = current.findIndex(
          (m) =>
            m.id.startsWith("optimistic-") &&
            m.message === payload.message.message &&
            m.senderId === "self" &&
            !payload.message.is_system,
        );

        if (optimisticIndex >= 0) {
          const next = [...current];
          next[optimisticIndex] = payload.message;
          return next;
        }

        return [...current, payload.message];
      });

      if (!conversationId) refetch();
    };

    const onResolved = (payload: { conversationId: string }) => {
      if (conversationId && payload.conversationId !== conversationId) return;
      setResolved(true);
    };

    socket.on("new-message", onMessage);
    socket.on("chat-resolved", onResolved);
    // A reconnect may have missed echoes - the DB is the source of truth.
    socket.on("connect", refetch);

    return () => {
      socket.off("new-message", onMessage);
      socket.off("chat-resolved", onResolved);
      socket.off("connect", refetch);
    };
  }, [isOpen, conversationId, refetch]);

  // Opening the panel clears the unread counter.
  useEffect(() => {
    if (isOpen && conversationId && (data?.data.unread ?? 0) > 0) {
      api.post(API_ENDPOINTS.chat.read(conversationId), {}).catch(() => {});
    }
  }, [isOpen, conversationId, data?.data.unread]);

  const { mutate: postMessage, isPending: isSending } = useSubmitData<
    { message: string },
    APIResponse<{ conversationId: string; message: ChatMessage }>
  >({
    url: API_ENDPOINTS.chat.message,
    silent: true,
    skipRefetch: true,
    onSuccess: (response) => {
      // A send can open a fresh thread - resync so echoes on the new conversation id aren't dropped.
      if (!conversationId || response.data.conversationId !== conversationId)
        refetch();
      const message = response.data.message;
      seenIds.current.add(message.id);
      setLiveMessages((current) => {
        const optimisticIndex = current.findIndex(
          (m) =>
            m.id.startsWith("optimistic-") && m.message === message.message,
        );
        if (optimisticIndex >= 0) {
          const next = [...current];
          next[optimisticIndex] = message;
          return next;
        }
        return current.some((m) => m.id === message.id)
          ? current
          : [...current, message];
      });
    },
    onError: () => {
      setLiveMessages((current) =>
        current.filter((m) => !m.id.startsWith("optimistic-")),
      );
    },
  });

  const sendMessage = useCallback(
    (text: string) => {
      const message = text.trim();
      if (!message) return;

      setResolved(false);
      setLiveMessages((current) => [
        ...current,
        {
          id: `optimistic-${Date.now()}`,
          conversationId: conversationId ?? "",
          senderId: "self",
          sender: null,
          is_system: false,
          is_from_ai: false,
          message,
          sent_at: new Date().toISOString(),
        },
      ]);

      postMessage({ message });
    },
    [conversationId, postMessage],
  );

  const messages = [...(conversation?.messages ?? [])];
  for (const entry of liveMessages) {
    if (!messages.some((m) => m.id === entry.id)) messages.push(entry);
  }

  const hasAgent = (conversation?.participants.length ?? 0) > 1;

  const awaitingAi =
    isSending && !hasAgent && (conversation?.status ?? "WAITING") === "WAITING";

  return {
    conversation,
    messages,
    isFetching,
    isSending,
    awaitingAi,
    resolved: resolved || conversation?.status === "RESOLVED",
    hasAgent,
    sendMessage,
  };
};
