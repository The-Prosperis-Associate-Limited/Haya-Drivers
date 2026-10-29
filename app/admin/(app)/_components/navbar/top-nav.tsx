"use client";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { GlobalSearch } from "@/components/search/global-search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getInitials } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { activeAdminHref } from "./nav-content";
import { ADMIN_FOOTER_LINKS, ADMIN_NAV_LINKS } from "./nav-links";

const ALL_LINKS = [...ADMIN_NAV_LINKS, ...ADMIN_FOOTER_LINKS];

const SEARCH_PAGES = ALL_LINKS.map(({ label, href }) => ({ label, href }));

interface Props {
  mobileTrigger?: React.ReactNode;
  user?: { display_name: string | null; profile_pic: string | null };
}

export const AdminTopNav = function ({ mobileTrigger, user }: Props) {
  const pathname = usePathname();
  const activeHref = activeAdminHref(pathname);
  const title =
    ALL_LINKS.find((link) => link.href === activeHref)?.label ?? "Overview";

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header className="border-border sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-white/85 px-4 backdrop-blur-md md:px-6 lg:h-[72px] lg:px-7">
      {mobileTrigger}

      <div className="mr-3 hidden shrink-0 lg:block">
        <p className="text-ink text-lg leading-tight font-semibold tracking-tight">
          {title}
        </p>
        {/* The server renders its own clock's date; the browser's wins. */}
        <p className="text-muted-foreground text-xs" suppressHydrationWarning>
          {today}
        </p>
      </div>

      <div className="max-w-md min-w-0 flex-1">
        <GlobalSearch
          placeholder="Search drivers, clients, references…"
          searchUrl={API_ENDPOINTS.search.admin}
          hrefPrefix="/admin"
          pages={SEARCH_PAGES}
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <NotificationBell actionUrlPrefix="/admin" />

        <Link
          href="/admin/dashboard/settings"
          className="border-border hover:border-brand/40 ml-1.5 hidden max-w-[220px] items-center gap-2.5 rounded-full border py-1 pr-3.5 pl-1 transition-colors lg:flex"
        >
          <Avatar className="size-8 shrink-0">
            <AvatarImage src={user?.profile_pic ?? undefined} alt="" />
            <AvatarFallback className="text-xs">
              {getInitials(user?.display_name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-ink truncate text-[13px] font-semibold">
            {user?.display_name?.split(" ")[0] ?? "Admin"}
          </span>
        </Link>
      </div>
    </header>
  );
};
