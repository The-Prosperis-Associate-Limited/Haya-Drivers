"use client";

import { AppText } from "@/components/shared/app-text";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TegatLogo } from "@/components/svg/logo";
import { useGetData } from "@/hooks/use-get-data";
import { clearAuthCookies } from "@/lib/authService";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn, getInitials } from "@/lib/utils";
import { ListChecks, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { APIResponse } from "@/types/response";
import { FOOTER_LINKS, NAV_LINKS, type NavLink } from "./nav-links";

interface Props {
  user?: {
    display_name: string | null;
    profile_pic: string | null;
    state_of_residence: string | null;
    country: string | null;
    email: string | null;
    onboarding_pending?: boolean;
  };
  onNavigate?: () => void;
}

const MY_HIRE_HREF = "/dashboard/my-hire";

// The longest matching href wins, so /dashboard/requests/find-talent lights up
// "Find drivers" without also lighting up "Requests".
export const activeNavHref = function (pathname: string) {
  return [...NAV_LINKS, ...FOOTER_LINKS]
    .map((link) => link.href)
    .filter((href) =>
      href === "/dashboard"
        ? pathname === href
        : pathname === href || pathname.startsWith(`${href}/`),
    )
    .sort((a, b) => b.length - a.length)[0];
};

export const NavContent = function ({ user, onNavigate }: Props) {
  const pathname = usePathname();
  const [signOutOpen, setSignOutOpen] = useState(false);

  const { data } = useGetData<APIResponse<{ open_requests: number }>>({
    url: API_ENDPOINTS.dashboard.stats,
  });

  const openRequests = data?.data.open_requests ?? 0;
  const activeHref = activeNavHref(pathname);

  // Clients never set a location anywhere, so the email stands in rather than
  // a permanent "Location not set".
  const location = [user?.state_of_residence, user?.country]
    .filter(Boolean)
    .join(", ");
  const subtitle = location || user?.email || "";

  const signOut = () => {
    clearAuthCookies();
    window.location.href = "/auth/signin";
  };

  const renderLink = (link: NavLink) => {
    const Icon = link.icon;
    const active = link.href === activeHref;
    const count = link.href === MY_HIRE_HREF ? openRequests : 0;

    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          active
            ? "bg-brand text-white shadow-[0_6px_16px_-8px_rgba(47,107,246,0.7)]"
            : "text-muted-foreground hover:text-foreground hover:bg-slate-50",
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {link.label}
        {!!count && (
          <span
            aria-label={`${count} open hire request${count > 1 ? "s" : ""}`}
            className={cn(
              "ml-auto min-w-[22px] rounded-full px-1.5 text-center text-[11px] font-semibold",
              active ? "bg-white/20 text-white" : "bg-brand-soft text-brand",
            )}
          >
            {count}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-5 pt-5 pb-3"
      >
        <TegatLogo size={36} />
        <span className="leading-tight">
          <span className="text-ink block text-base font-bold tracking-tight">
            Haya Drivers
          </span>
          <span className="text-muted-foreground block text-[11px] font-medium">
            Client workspace
          </span>
        </span>
      </Link>

      <div className="flex-1 overflow-y-auto px-3.5 pb-4">
        <AppText
          type="caption"
          className="mx-2.5 mt-4 mb-2 block text-[11px] font-semibold tracking-[0.08em] text-slate-400 uppercase"
        >
          Menu
        </AppText>
        <nav className="space-y-0.5">
          {NAV_LINKS.map((link) => renderLink(link))}
        </nav>

        <AppText
          type="caption"
          className="mx-2.5 mt-5 mb-2 block text-[11px] font-semibold tracking-[0.08em] text-slate-400 uppercase"
        >
          Account
        </AppText>
        <nav className="space-y-0.5">
          {FOOTER_LINKS.map((link) => renderLink(link))}
        </nav>

        <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-blue-900 p-4 text-white">
          <span className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full border border-white/15" />
          {user?.onboarding_pending ? (
            <>
              <span className="flex items-center gap-2 text-sm font-semibold">
                <ListChecks className="size-4" />
                Finish setting up
              </span>
              <p className="mt-1 text-xs text-white/70">
                Five quick questions so we can match you with the right drivers.
              </p>
              <Button
                asChild
                variant="ghost"
                className="text-brand mt-3 h-9 w-full rounded-xl bg-white text-xs hover:bg-white/90"
              >
                <Link href="/onboarding" onClick={onNavigate}>
                  Get started
                </Link>
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm font-semibold">
                Need another driver?
              </span>
              <p className="mt-1 text-xs text-white/70">
                Tell us what you need and our team sends you a vetted shortlist.
              </p>
              <Button
                asChild
                variant="ghost"
                className="text-brand mt-3 h-9 w-full rounded-xl bg-white text-xs hover:bg-white/90"
              >
                <Link href="/dashboard/my-hire/request" onClick={onNavigate}>
                  <Plus className="size-3.5" />
                  Request a driver
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="border-border mx-3.5 mb-3.5 flex items-center gap-3 rounded-2xl border p-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.profile_pic ?? undefined} alt="" />
          <AvatarFallback>{getInitials(user?.display_name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <AppText type="label" className="block truncate">
            {user?.display_name ?? "Client"}
          </AppText>
          <AppText
            type="caption"
            className="text-muted-foreground block truncate"
          >
            {subtitle}
          </AppText>
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Sign out"
          onClick={() => setSignOutOpen(true)}
          className="text-muted-foreground size-9 shrink-0"
        >
          <LogOut className="size-4" />
        </Button>
      </div>

      <ConfirmDialog
        isOpen={signOutOpen}
        onOpenChange={setSignOutOpen}
        icon={LogOut}
        iconClassName="text-destructive"
        title="Sign out of Haya Drivers?"
        description="You'll need your email and password to sign back in."
        confirmLabel="Sign out"
        confirmVariant="destructive"
        onConfirm={signOut}
      />
    </div>
  );
};
