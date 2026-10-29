"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { SupportWidget } from "@/components/support/support-widget";
import { TegatLogo } from "@/components/svg/logo";
import { useGetProfile } from "@/hooks/use-get-profile";
import { cn, getInitials } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "Dashboard", href: "/dashboard" },
];

export const MarketplaceHeader = function () {
  const pathname = usePathname();
  const { profile } = useGetProfile();

  return (
    <>
      <header className="border-border border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
          <Link href="/marketplace" aria-label="Marketplace home">
            <TegatLogo size={40} />
          </Link>

          <div className="flex items-center gap-1 md:gap-4">
            <nav className="flex items-center gap-4 md:gap-6">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium underline-offset-4 transition-colors",
                    pathname.startsWith(link.href)
                      ? "text-ink underline"
                      : "text-muted-foreground hover:text-ink",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <NotificationBell iconClassName="h-[20px] w-[20px]" />

              <Avatar className="ml-1 h-9 w-9">
                <AvatarImage src={profile?.profile_pic ?? undefined} alt="" />
                <AvatarFallback>
                  {getInitials(profile?.first_name, profile?.last_name)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <SupportWidget storageKey="haya-support-position-client" />
    </>
  );
};
