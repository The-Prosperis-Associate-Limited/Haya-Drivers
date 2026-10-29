"use client";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { GlobalSearch } from "@/components/search/global-search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getInitials } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
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
        <NotificationBell />

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
  );
};
