"use client";

import { GlobalSearch } from "@/components/search/global-search";
import { Button } from "@/components/ui/button";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { Bell } from "lucide-react";
import { useState } from "react";
import type { APIResponse } from "@/types/response";
import { NotificationsSheet } from "@/components/notifications/notifications-sheet";
import { ADMIN_FOOTER_LINKS, ADMIN_NAV_LINKS } from "./nav-links";

const SEARCH_PAGES = [...ADMIN_NAV_LINKS, ...ADMIN_FOOTER_LINKS].map(
  ({ label, href }) => ({ label, href }),
);

interface Props {
  mobileTrigger?: React.ReactNode;
}

export const AdminTopNav = function ({ mobileTrigger }: Props) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { data } = useGetData<APIResponse<{ count: number }>>({
    url: API_ENDPOINTS.notifications.unreadCount,
  });

  const unread = data?.data.count ?? 0;

  return (
    <>
      <header className="border-border flex h-16 shrink-0 items-center gap-3 border-b bg-white px-4 md:px-6">
        {mobileTrigger}

        <div className="max-w-md min-w-0 flex-1">
          <GlobalSearch
            placeholder="Search drivers, clients, references…"
            searchUrl={API_ENDPOINTS.search.admin}
            hrefPrefix="/admin"
            pages={SEARCH_PAGES}
          />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
            }
            onClick={() => setNotificationsOpen(true)}
            className="size-10"
          >
            <span className="relative inline-flex">
              <Bell className="h-5.5 w-5.5" />
              {unread > 0 && (
                <span className="bg-brand ring-background absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] leading-none font-semibold text-white ring-2">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </span>
          </Button>
        </div>
      </header>

      <NotificationsSheet
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        actionUrlPrefix="/admin"
      />
    </>
  );
};
