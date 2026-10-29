"use client";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { GlobalSearch } from "@/components/search/global-search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getInitials } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FOOTER_LINKS, NAV_LINKS } from "./nav-links";

interface Props {
  mobileTrigger?: React.ReactNode;
  user?: {
    first_name: string | null;
    last_name: string | null;
    profile_pic: string | null;
  };
}

const SEARCH_PAGES = [
  ...[...NAV_LINKS, ...FOOTER_LINKS].map(({ label, href }) => ({
    label,
    href,
  })),
  { label: "My public profile", href: "/driver/dashboard/profile-preview" },
  { label: "Support", href: "/driver/dashboard/support" },
];

const titleFor = (pathname: string) => {
  if (pathname.startsWith("/driver/dashboard/support")) return "Support";
  if (pathname.startsWith("/driver/dashboard/profile-preview"))
    return "My public profile";

  const match = [...NAV_LINKS, ...FOOTER_LINKS]
    .filter((link) =>
      link.href === "/driver/dashboard"
        ? pathname === link.href
        : pathname.startsWith(link.href),
    )
    .at(0);

  return match?.label ?? "Overview";
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
          placeholder="Search jobs, reviews…"
          searchUrl={API_ENDPOINTS.search.driver}
          hrefPrefix="/driver"
          pages={SEARCH_PAGES}
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <NotificationBell actionUrlPrefix="/driver" />

        <Link
          href="/driver/dashboard/settings"
          className="border-border hover:border-brand/40 ml-1.5 hidden items-center gap-2.5 rounded-full border py-1 pr-3.5 pl-1 transition-colors lg:flex"
        >
          <Avatar className="size-8">
            <AvatarImage src={user?.profile_pic ?? undefined} alt="" />
            <AvatarFallback className="text-xs">
              {getInitials(user?.first_name, user?.last_name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-ink text-[13px] font-semibold">
            {user?.first_name ?? "Driver"}
          </span>
        </Link>
      </div>
    </header>
  );
};
