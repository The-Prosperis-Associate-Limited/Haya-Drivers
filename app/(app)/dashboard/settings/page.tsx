"use client";

import { AppTabs } from "@/components/shared/app-tabs";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { clearAuthCookies } from "@/lib/authService";
import { LogOut } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { NotificationSettings } from "./_components/notification-settings";
import { ProfileSettings } from "./_components/profile-settings";
import { SecuritySettings } from "@/components/settings/security-settings";

const TAB_VALUES = ["profile", "notifications", "security"] as const;

type Tab = (typeof TAB_VALUES)[number];

const isTab = (value: string | null): value is Tab =>
  TAB_VALUES.includes(value as Tab);

function SettingsContent() {
  const searchParams = useSearchParams();
  const requested = searchParams.get("tab");

  const [tab, setTab] = useState<Tab>(isTab(requested) ? requested : "profile");
  const [signOutOpen, setSignOutOpen] = useState(false);

  const signOut = () => {
    clearAuthCookies();
    window.location.href = "/auth/signin";
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, security and how Haya Drivers reaches you."
        action={
          <Button
            variant="outline"
            onClick={() => setSignOutOpen(true)}
            className="text-destructive border-destructive/40 h-10 rounded-lg px-4"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        }
      />

      <AppTabs
        variant="pill"
        value={tab}
        onValueChange={setTab}
        tabs={[
          {
            value: "profile",
            label: "User profile",
            content: <ProfileSettings />,
          },
          {
            value: "notifications",
            label: "Notifications",
            content: <NotificationSettings />,
          },
          {
            value: "security",
            label: "Security",
            content: <SecuritySettings />,
          },
        ]}
      />

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
}

export default function Settings() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}
