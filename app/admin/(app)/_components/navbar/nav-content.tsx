"use client";

import { AppText } from "@/components/shared/app-text";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TegatLogo } from "@/components/svg/logo";
import { useGetData } from "@/hooks/use-get-data";
import { ADMIN_ROLE_LABELS } from "@/lib/admin";
import { clearAuthCookies } from "@/lib/authService";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn, getInitials } from "@/lib/utils";
import { LogOut, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { AdminNav, AdminRole } from "@/types/admin";
import type { APIResponse } from "@/types/response";
import {
  ADMIN_FOOTER_LINKS,
  ADMIN_NAV_LINKS,
  type AdminNavLink,
} from "./nav-links";

interface Props {
  user?: {
    id: string;
    display_name: string | null;
    profile_pic: string | null;
    admin_role: AdminRole | null;
  };
  onNavigate?: () => void;
}

const SECTION_LABEL =
  "mx-2.5 mb-2 block text-[11px] font-semibold tracking-[0.08em] text-slate-400 uppercase";

export const activeAdminHref = function (pathname: string) {
  return [...ADMIN_NAV_LINKS, ...ADMIN_FOOTER_LINKS]
    .map((link) => link.href)
    .filter((href) =>
      href === "/admin/dashboard"
        ? pathname === href
        : pathname === href || pathname.startsWith(`${href}/`),
    )
    .sort((a, b) => b.length - a.length)[0];
};

const teamLine = function (team: AdminNav["team"], userId?: string) {
  const others = team.filter((member) => member.id !== userId);
  const names = others.map((member) => member.name.split(" ")[0]);

  if (!names.length) return "You're the only one on the console right now.";
  if (names.length > 3)
    return `${names.slice(0, 2).join(", ")}, ${names.length - 2} others and you are online.`;
  return `${names.join(", ")} and you are online.`;
};

export const AdminNavContent = function ({ user, onNavigate }: Props) {
  const pathname = usePathname();
  const [signOutOpen, setSignOutOpen] = useState(false);

  const { data } = useGetData<APIResponse<AdminNav>>({
    url: API_ENDPOINTS.adminDashboard.nav,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const nav = data?.data;
  const activeHref = activeAdminHref(pathname);
  const waiting = nav?.chats_waiting ?? 0;

  const signOut = () => {
    clearAuthCookies();
    window.location.href = "/admin/auth/signin";
  };

  const renderLink = (link: AdminNavLink) => {
    const Icon = link.icon;
    const active = link.href === activeHref;
    const count = link.countKey ? (nav?.counts[link.countKey] ?? 0) : 0;

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
            aria-label={`${count} ${link.countLabel ?? ""}`.trim()}
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
        href="/admin/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-5 pt-5 pb-3"
      >
        <TegatLogo size={36} />
        <span className="leading-tight">
          <span className="text-ink block text-base font-bold tracking-tight">
            Haya Drivers
          </span>
          <span className="text-muted-foreground block text-[11px] font-medium">
            Admin console
          </span>
        </span>
      </Link>

      <div className="flex-1 overflow-y-auto px-3.5 pb-4">
        <AppText type="caption" className={cn(SECTION_LABEL, "mt-4")}>
          Operations
        </AppText>
        <nav className="space-y-0.5">
          {ADMIN_NAV_LINKS.map((link) => renderLink(link))}
        </nav>

        <AppText type="caption" className={cn(SECTION_LABEL, "mt-5")}>
          System
        </AppText>
        <nav className="space-y-0.5">
          {ADMIN_FOOTER_LINKS.map((link) => renderLink(link))}
        </nav>

        <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-blue-900 p-4 text-white">
          <span className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full border border-white/15" />
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.25)]" />
            Team on shift
          </span>
          <p className="mt-1 text-xs text-white/70">
            {teamLine(nav?.team ?? [], user?.id)}{" "}
            {waiting
              ? `${waiting} live chat${waiting > 1 ? "s are" : " is"} waiting for an agent.`
              : "No chats are waiting for an agent."}
          </p>
          <Button
            asChild
            variant="ghost"
            className="text-brand mt-3 h-9 w-full rounded-xl bg-white text-xs hover:bg-white/90"
          >
            <Link href="/admin/dashboard/support" onClick={onNavigate}>
              <MessagesSquare className="size-3.5" />
              Open inbox
            </Link>
          </Button>
        </div>
      </div>

      <div className="border-border mx-3.5 mb-3.5 flex items-center gap-3 rounded-2xl border p-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.profile_pic ?? undefined} alt="" />
          <AvatarFallback>{getInitials(user?.display_name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <AppText type="label" className="block truncate">
            {user?.display_name ?? "Admin"}
          </AppText>
          <AppText
            type="caption"
            className="text-muted-foreground block truncate"
          >
            {user?.admin_role ? ADMIN_ROLE_LABELS[user.admin_role] : "Admin"}
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
        title="Sign out of the admin console?"
        description="You'll need your email and password to sign back in."
        confirmLabel="Sign out"
        confirmVariant="destructive"
        onConfirm={signOut}
      />
    </div>
  );
};
