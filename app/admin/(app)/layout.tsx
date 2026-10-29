"use client";

import { useGetProfile } from "@/hooks/use-get-profile";
import { AdminMobileNav } from "./_components/navbar/mobile-nav";
import { AdminSidebar } from "./_components/navbar/sidebar";
import { AdminTopNav } from "./_components/navbar/top-nav";
import { useConsolePresence } from "./_hooks/use-console-presence";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = useGetProfile();

  useConsolePresence();

  const user = profile && {
    id: profile.id,
    display_name:
      [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
      profile.email,
    profile_pic: profile.profile_pic,
    admin_role: profile.admin_profile?.admin_role ?? null,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar user={user ?? undefined} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopNav
          mobileTrigger={<AdminMobileNav user={user ?? undefined} />}
          user={user ?? undefined}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
