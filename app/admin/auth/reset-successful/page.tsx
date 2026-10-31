"use client";

import { AuthShell } from "@/components/shared/auth-shell";
import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import { CircleCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminResetSuccessful() {
  const router = useRouter();

  return (
    <AuthShell surface="admin">
      <div className="bg-brand-soft mb-6 flex h-16 w-16 items-center justify-center rounded-full">
        <CircleCheck className="text-brand h-8 w-8" />
      </div>

      <AppText type="h2" className="mb-3 text-[26px] font-bold">
        Password reset successful
      </AppText>

      <AppText type="subtitle" className="text-muted-foreground mb-8 text-sm">
        Your password has been changed successfully. For security, we've signed
        you out on all other devices - use your new password to sign back in.
      </AppText>

      <Button
        onClick={() => router.push("/admin/auth/signin")}
        className="h-12 w-full rounded-lg text-sm"
      >
        Sign in with your new password
      </Button>
    </AuthShell>
  );
}
