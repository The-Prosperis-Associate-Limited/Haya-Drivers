"use client";

import { useGetProfile } from "@/hooks/use-get-profile";
import { ReactivateAccountDialog } from "@/components/shared/reactivate-account-dialog";
import { SupportWidget } from "./_components/support/support-widget";
import { MobileNav } from "./_components/navbar/mobile-nav";
import { Sidebar } from "./_components/navbar/sidebar";
import { TopNav } from "./_components/navbar/top-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = useGetProfile();

  const status = profile?.driver_profile?.verification_status;

  const user = profile && {
    first_name: profile.first_name,
    last_name: profile.last_name,
    profile_pic: profile.profile_pic,
    state_of_residence: profile.state_of_residence,
    country: profile.country,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 print:h-auto print:overflow-visible print:bg-white">
      <Sidebar status={status} user={user ?? undefined} />

      <div className="flex flex-1 flex-col overflow-hidden print:overflow-visible">
        <TopNav
          mobileTrigger={<MobileNav status={status} user={user ?? undefined} />}
          user={user ?? undefined}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-7 print:overflow-visible print:p-0">
          {children}
        </main>
      </div>

      <ReactivateAccountDialog />
      <SupportWidget storageKey="haya-support-position-driver" />
    </div>
  );
}
