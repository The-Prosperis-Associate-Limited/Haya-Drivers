"use client";

import { AppText } from "@/components/shared/app-text";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TegatLogo } from "@/components/svg/logo";
import { clearAuthCookies } from "@/lib/authService";
import { cn, getInitials } from "@/lib/utils";
import {
  BadgeCheck,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { DriverVerificationStatus } from "@/types/driver";
import { useJobRequestSummary } from "../../dashboard/job-request/_hooks/use-job-requests";
import { FOOTER_LINKS, NAV_LINKS, type NavLink } from "./nav-links";

interface Props {
  status?: DriverVerificationStatus;
  user?: {
    first_name: string | null;
    last_name: string | null;
    profile_pic: string | null;
    state_of_residence: string | null;
    country: string | null;
  };
  onNavigate?: () => void;
}

const JOBS_HREF = "/driver/dashboard/job-request";

export const NavContent = function ({ status, user, onNavigate }: Props) {
  const pathname = usePathname();
  const [signOutOpen, setSignOutOpen] = useState(false);

  const isVerified = status === "APPROVED";
  const { summary } = useJobRequestSummary(isVerified);

  const isActive = (href: string) =>
    href === "/driver/dashboard"
      ? pathname === href
      : pathname.startsWith(href);

  const location = [user?.state_of_residence, user?.country]
    .filter(Boolean)
    .join(", ");

  const name =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Driver";

  const signOut = () => {
    clearAuthCookies();
    window.location.href = "/driver/auth/signin";
  };

  const renderLink = (link: NavLink) => {
    const Icon = link.icon;
    const active = isActive(link.href);
    // Children only unfold once the section is the one being looked at, so the
    // sidebar stays four rows tall the rest of the time.
    const expanded = active && !!link.children?.length;
    const count = link.href === JOBS_HREF ? summary?.active : undefined;

    return (
      <div key={link.href}>
        <Link
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
              className={cn(
                "ml-auto min-w-[22px] rounded-full px-1.5 text-center text-[11px] font-semibold",
                active ? "bg-white/20 text-white" : "bg-brand-soft text-brand",
              )}
            >
              {count}
            </span>
          )}
          {!!link.children?.length && (
            <ChevronDown
              className={cn(
                "ml-auto h-4 w-4 shrink-0 transition-transform",
                expanded && "rotate-180",
              )}
            />
          )}
        </Link>

        {expanded &&
          link.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              className={cn(
                "block rounded-lg py-2 pl-11 text-sm font-medium transition-colors",
                pathname === child.href
                  ? "text-brand"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {child.label}
            </Link>
          ))}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <Link
        href="/driver/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-5 pt-5 pb-3"
      >
        <TegatLogo size={36} />
        <span className="leading-tight">
          <span className="text-ink block text-base font-bold tracking-tight">
            Haya Drivers
          </span>
          <span className="text-muted-foreground block text-[11px] font-medium">
            Driver workspace
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
          {isVerified ? (
            <>
              <span className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="size-4" />
                Grow your trust score
              </span>
              <p className="mt-1 text-xs text-white/70">
                Every completed job and good review lifts you up the search
                results.
              </p>
              <Button
                asChild
                variant="ghost"
                className="text-brand mt-3 h-9 w-full rounded-xl bg-white text-xs hover:bg-white/90"
              >
                <Link href="/driver/dashboard/trust-score" onClick={onNavigate}>
                  See what counts
                </Link>
              </Button>
            </>
          ) : (
            <>
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="size-4" />
                Get verified
              </span>
              <p className="mt-1 text-xs text-white/70">
                Clients only see verified drivers. Finish your application to
                start getting jobs.
              </p>
              <Button
                asChild
                variant="ghost"
                className="text-brand mt-3 h-9 w-full rounded-xl bg-white text-xs hover:bg-white/90"
              >
                <Link href="/driver/onboarding" onClick={onNavigate}>
                  Continue setup
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="border-border mx-3.5 mb-3.5 flex items-center gap-3 rounded-2xl border p-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profile_pic ?? undefined} alt="" />
            <AvatarFallback>
              {getInitials(user?.first_name, user?.last_name)}
            </AvatarFallback>
          </Avatar>
          {isVerified && (
            <BadgeCheck className="fill-brand absolute -right-0.5 -bottom-0.5 h-4 w-4 text-white" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <AppText type="label" className="block truncate">
            {name}
          </AppText>
          <AppText
            type="caption"
            className="text-muted-foreground block truncate"
          >
            {location || "Location not set"}
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
