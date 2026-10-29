"use client";

import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn, formatRelativeTime, groupByRecency } from "@/lib/utils";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AppNotification } from "@/types/notification";
import type { APIResponse, PaginatedResponse } from "@/types/response";

interface Props {
  // Server actionUrls are surface-relative (/dashboard/...); the driver and admin top bars pass their prefix.
  actionUrlPrefix?: string;
  iconClassName?: string;
  className?: string;
}

const listUrl = API_ENDPOINTS.notifications.list({ page: 1, limit: 30 });

export const NotificationBell = function ({
  actionUrlPrefix = "",
  iconClassName = "h-[22px] w-[22px]",
  className,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data: unreadData } = useGetData<APIResponse<{ count: number }>>({
    url: API_ENDPOINTS.notifications.unreadCount,
  });
  const { data, isFetching } = useGetData<PaginatedResponse<AppNotification>>({
    url: listUrl,
    shouldFetch: open,
  });

  const { mutate: markAllAsRead, isPending: isMarkingAll } = useSubmitData({
    url: API_ENDPOINTS.notifications.markAllAsRead,
    method: "patch",
    onSuccessMessage: "All notifications marked as read",
    additionalQueryKeys: [[listUrl], [API_ENDPOINTS.notifications.unreadCount]],
  });

  const { mutate: markAsRead } = useSubmitData<{ id: string }>({
    url: (payload) => API_ENDPOINTS.notifications.markAsRead(payload.id),
    method: "patch",
    silent: true,
    additionalQueryKeys: [[listUrl], [API_ENDPOINTS.notifications.unreadCount]],
  });

  const unread = unreadData?.data.count ?? 0;
  const notifications = data?.data ?? [];

  const groups = notifications.reduce<Record<string, AppNotification[]>>(
    (accumulator, notification) => {
      const key = groupByRecency(notification.createdAt);
      accumulator[key] = [...(accumulator[key] ?? []), notification];
      return accumulator;
    },
    {},
  );

  const openNotification = (notification: AppNotification) => {
    if (notification.status === "UNREAD") markAsRead({ id: notification.id });
    if (notification.actionUrl) {
      setOpen(false);
      router.push(`${actionUrlPrefix}${notification.actionUrl}`);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={
            unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
          }
          className={cn("size-10 rounded-xl", className)}
        >
          <span className="relative inline-flex">
            <Bell className={iconClassName} />
            {unread > 0 && (
              <span className="bg-brand ring-background absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] leading-none font-semibold text-white ring-2">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="w-[min(400px,calc(100vw-24px))] gap-0 overflow-hidden rounded-2xl p-0 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.25)]"
      >
        <div className="border-border flex items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            <AppText type="h4" className="text-[15px] font-semibold">
              Notifications
            </AppText>
            <AppText type="caption" className="text-muted-foreground block">
              {unread ? `${unread} unread` : "You're all caught up"}
            </AppText>
          </div>
          {unread > 0 && (
            <Button
              variant="ghost"
              className="text-brand h-8 rounded-lg px-2 text-xs font-semibold"
              disabled={isMarkingAll}
              onClick={() => markAllAsRead({})}
            >
              <CheckCheck className="size-3.5" />
              Mark all as read
            </Button>
          )}
        </div>

        <div className="max-h-[min(70vh,520px)] overflow-y-auto overscroll-contain p-2">
          {isFetching && !notifications.length ? (
            <div className="space-y-2 p-2">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : !notifications.length ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <span className="grid size-11 place-items-center rounded-full bg-slate-100 text-slate-500">
                <BellOff className="size-5" />
              </span>
              <AppText type="label" className="font-semibold">
                Nothing here yet
              </AppText>
              <AppText type="caption" className="text-muted-foreground">
                Hires, payments and verification updates will show up here.
              </AppText>
            </div>
          ) : (
            Object.entries(groups).map(([label, items]) => (
              <div key={label} className="pb-1">
                <p className="px-2.5 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  {label}
                </p>
                {items.map((notification) => {
                  const isUnread = notification.status === "UNREAD";

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => openNotification(notification)}
                      className={cn(
                        "flex w-full cursor-pointer gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-slate-50",
                        isUnread && "bg-brand-soft/50",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-1.5 size-2 shrink-0 rounded-full",
                          isUnread ? "bg-brand" : "bg-transparent",
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        {notification.title && (
                          <span className="text-ink block text-[13px] font-semibold">
                            {notification.title}
                          </span>
                        )}
                        <span className="text-foreground/80 block text-[13px] leading-snug">
                          {notification.message}
                        </span>
                        <span className="text-muted-foreground mt-1 block text-xs">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
