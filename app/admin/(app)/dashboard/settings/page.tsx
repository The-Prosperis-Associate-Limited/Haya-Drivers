"use client";

import { AppTabs } from "@/components/shared/app-tabs";
import { AppText } from "@/components/shared/app-text";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useGetProfile } from "@/hooks/use-get-profile";
import { clearAuthCookies } from "@/lib/authService";
import { LogOut } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ActivityTimeline } from "../../_components/activity-timeline";
import { NotificationsTab } from "./_components/notifications-tab";
import { ProfileTab } from "./_components/profile-tab";
import { SecurityTab } from "./_components/security-tab";
import { TeamTab } from "./_components/team-tab";

type Tab = "profile" | "security" | "notifications" | "activity" | "team";

function AdminSettings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useGetProfile();
  const [signOutOpen, setSignOutOpen] = useState(false);

  const tab = (searchParams.get("tab") as Tab) || "profile";

  const signOut = () => {
    clearAuthCookies();
    window.location.href = "/admin/auth/signin";
  };

  // Pre-roles admins have no profile row and are treated as supers.
  const isSuperAdmin =
    !profile?.admin_profile ||
    profile.admin_profile.admin_role === "SUPER_ADMIN";

  const tabs: { value: Tab; label: string }[] = [
    { value: "profile", label: "Account Profile" },
    { value: "security", label: "Security" },
    { value: "notifications", label: "Notification Preferences" },
    { value: "activity", label: "Activity Log" },
    ...(isSuperAdmin
      ? [{ value: "team" as const, label: "Roles and Permission" }]
      : []),
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <AppText
            type="h2"
            className="text-[22px] font-semibold tracking-tight"
          >
            Settings
          </AppText>
          <AppText
            type="subtitle"
            className="text-muted-foreground text-[13px]"
          >
            Your account, security and console access.
          </AppText>
        </div>

        <Button
          variant="outline"
          onClick={() => setSignOutOpen(true)}
          className="text-destructive border-destructive/40 h-10 rounded-lg px-4"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>

      <AppTabs<Tab>
        value={tab}
        onValueChange={(value) =>
          router.replace(`/admin/dashboard/settings?tab=${value}`)
        }
        variant="pill"
        tabs={tabs}
      />

      {tab === "profile" && <ProfileTab />}
      {tab === "security" && <SecurityTab />}
      {tab === "notifications" && <NotificationsTab />}
      {tab === "activity" && profile && (
        <ActivityTimeline userId={profile.id} />
      )}
      {tab === "team" && isSuperAdmin && <TeamTab />}

      <ConfirmDialog
        isOpen={signOutOpen}
        onOpenChange={setSignOutOpen}
        icon={LogOut}
        iconClassName="text-destructive"
        title="Sign out of the console?"
        description="You'll need your email and password to sign back in."
        confirmLabel="Sign out"
        confirmVariant="destructive"
        onConfirm={signOut}
      />
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={null}>
      <AdminSettings />
    </Suspense>
  );
}
