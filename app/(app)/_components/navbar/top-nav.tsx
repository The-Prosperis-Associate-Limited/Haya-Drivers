"use client";

import { NotificationsSheet } from "@/components/notifications/notifications-sheet";
import { GlobalSearch } from "@/components/search/global-search";
import { SupportSheet } from "@/components/support/support-sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getInitials } from "@/lib/utils";
import { Bell, Headset } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSupportSheet } from "@/store/use-support-sheet";
import type { APIResponse } from "@/types/response";
import { activeNavHref } from "./nav-content";
import { FOOTER_LINKS, NAV_LINKS } from "./nav-links";

interface Props {
  mobileTrigger?: React.ReactNode;
  user?: { display_name: string | null; profile_pic: string | null };
}

const EXTRA_TITLES: [string, string][] = [
  ["/dashboard/my-hire/request", "Request a driver"],
  ["/dashboard/drivers", "Driver profile"],
];

const SEARCH_PAGES = [
  ...[...NAV_LINKS, ...FOOTER_LINKS].map(({ label, href }) => ({
    label,
    href,
  })),
  { label: "Request a driver", href: "/dashboard/my-hire/request" },
];

const titleFor = (pathname: string) => {
  const extra = EXTRA_TITLES.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (extra) return extra[1];

  const href = activeNavHref(pathname);
  return (
    [...NAV_LINKS, ...FOOTER_LINKS].find((link) => link.href === href)?.label ??
    "Dashboard"
  );
};

export const TopNav = function ({ mobileTrigger, user }: Props) {
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const supportOpen = useSupportSheet((state) => state.open);
  const setSupportOpen = useSupportSheet((state) => state.setOpen);

  const { data } = useGetData<APIResponse<{ count: number }>>({
    url: API_ENDPOINTS.notifications.unreadCount,
  });

  const unread = data?.data.count ?? 0;

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <header className="border-border sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-white/85 px-4 backdrop-blur-md md:px-6 lg:h-[72px] lg:px-7 print:hidden">
        {mobileTrigger}

        <div className="mr-3 hidden shrink-0 lg:block">
          <p className="text-ink text-lg leading-tight font-semibold tracking-tight">
            {titleFor(pathname)}
          </p>
          {/* The server renders its own clock's date; the browser's wins. */}
          <p className="text-muted-foreground text-xs" suppressHydrationWarning>
            {today}
          </p>
        </div>

        <div className="max-w-md min-w-0 flex-1">
          <GlobalSearch
            placeholder="Search drivers, invoices…"
            searchUrl={API_ENDPOINTS.search.client}
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
            className="size-10 rounded-xl"
          >
            {/* The badge hangs off the icon's corner rather than sitting on it -
                anchored to the icon, not the button, so it clears the glyph. */}
            <span className="relative inline-flex">
              <Bell className="h-[22px] w-[22px]" />
              {unread > 0 && (
                <span className="bg-brand ring-background absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] leading-none font-semibold text-white ring-2">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Support"
            onClick={() => setSupportOpen(true)}
            className="size-10 rounded-xl"
          >
            <Headset className="h-[22px] w-[22px]" />
          </Button>

          <Link
            href="/dashboard/settings"
            className="border-border hover:border-brand/40 ml-1.5 hidden max-w-[220px] items-center gap-2.5 rounded-full border py-1 pr-3.5 pl-1 transition-colors lg:flex"
          >
            <Avatar className="size-8 shrink-0">
              <AvatarImage src={user?.profile_pic ?? undefined} alt="" />
              <AvatarFallback className="text-xs">
                {getInitials(user?.display_name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-ink truncate text-[13px] font-semibold">
              {user?.display_name ?? "Client"}
            </span>
          </Link>
        </div>
      </header>

      <NotificationsSheet
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
      <SupportSheet open={supportOpen} onOpenChange={setSupportOpen} />
    </>
  );
};
