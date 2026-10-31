"use client";

import { AppText } from "@/components/shared/app-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn, formatAge, getInitials } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { AdminNav } from "@/types/admin";
import type { ChatInbox } from "@/types/chat";
import type { APIResponse } from "@/types/response";

export const SupportInboxCard = function () {
  const [now] = useState(() => Date.now());

  const { data, isFetching } = useGetData<APIResponse<ChatInbox>>({
    url: API_ENDPOINTS.adminChat.list({ page: 1, limit: 3 }),
    staleTime: 30 * 1000,
  });
  const { data: navData } = useGetData<APIResponse<AdminNav>>({
    url: API_ENDPOINTS.adminDashboard.nav,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const conversations = data?.data.data ?? [];
  const online = navData?.data.team.length ?? 0;

  return (
    <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <AppText type="h4" className="text-[15px] font-semibold">
            Support inbox
          </AppText>
          <Link
            href="/admin/dashboard/support"
            className="text-brand inline-flex items-center gap-0.5 text-xs font-semibold"
          >
            Open inbox
            <ChevronRight className="size-3" />
          </Link>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11.5px] font-semibold text-emerald-700">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {online} agent{online === 1 ? "" : "s"} online
        </span>
      </div>

      <div className="mt-3 divide-y divide-slate-100">
        {isFetching && !data ? (
          <Skeleton className="h-28 w-full rounded-xl" />
        ) : !conversations.length ? (
          <AppText
            type="caption"
            className="text-muted-foreground block py-4 text-center"
          >
            No open conversations.
          </AppText>
        ) : (
          conversations.map((conversation) => {
            const person = conversation.initiatedBy;
            const name =
              [person?.first_name, person?.last_name]
                .filter(Boolean)
                .join(" ") || "Visitor";
            const needsAgent =
              conversation.status === "ACTIVE" &&
              conversation.participants.every(
                (participant) =>
                  participant.userId === conversation.initiatedById,
              );
            const minutes =
              (now - new Date(conversation.last_updated).getTime()) / 60000;

            return (
              <Link
                key={conversation.id}
                href="/admin/dashboard/support"
                className="flex items-center gap-3 py-2.5"
              >
                <Avatar className="size-9 shrink-0">
                  <AvatarImage src={person?.profile_pic ?? undefined} alt="" />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(person?.first_name, person?.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <AppText
                    type="label"
                    className="block truncate text-[13.5px] font-semibold"
                  >
                    {name}
                  </AppText>
                  <AppText
                    type="caption"
                    className="text-muted-foreground block truncate"
                  >
                    {needsAgent
                      ? "Waiting for an agent"
                      : conversation.last_message
                        ? `"${conversation.last_message}"`
                        : "No messages yet"}
                  </AppText>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    needsAgent
                      ? "bg-amber-50 text-amber-700"
                      : minutes < 30
                        ? "bg-brand-soft text-brand"
                        : "bg-slate-100 text-slate-600",
                  )}
                >
                  {formatAge(conversation.last_updated, now)}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};
