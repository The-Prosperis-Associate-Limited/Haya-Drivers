"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import { useGetProfile } from "@/hooks/use-get-profile";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";

// Shown on any dashboard when the inactivity sweep has parked the account.
// The dialog cannot be dismissed - reactivating is the only way forward.
export const ReactivateAccountDialog = function () {
  const { profile } = useGetProfile();

  const { mutate, isPending } = useSubmitData({
    url: API_ENDPOINTS.auth.reactivate,
    onSuccessMessage: "Welcome back! Your account is active again.",
  });

  const dormant =
    profile?.account_status === "DEACTIVATED" &&
    profile?.deactivated_for_inactivity === true;

  if (!dormant) return null;

  return (
    <AppDialog
      isOpen
      onOpenChange={() => {}}
      isSubmitting
      title="Welcome back 👋"
      description="Your account was deactivated after 90 days of inactivity."
    >
      <div className="space-y-4">
        <AppText type="caption" className="text-muted-foreground block text-sm">
          Everything is exactly as you left it. Reactivate your account to pick
          up where you stopped.
        </AppText>
        <Button
          isLoading={isPending}
          onClick={() => mutate({})}
          className="h-12 w-full rounded-lg text-sm"
        >
          Reactivate my account
        </Button>
      </div>
    </AppDialog>
  );
};
