"use client";

import { AppDialog, DIALOG_BUTTON } from "@/components/shared/app-dialog";
import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import { useGetProfile } from "@/hooks/use-get-profile";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { UserRoundCheck } from "lucide-react";

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
      title="Welcome back"
      description="Your account was deactivated after 90 days of inactivity."
      dialogFooter={
        <Button
          isLoading={isPending}
          onClick={() => mutate({})}
          className={DIALOG_BUTTON}
        >
          Reactivate my account
        </Button>
      }
    >
      <div className="flex items-start gap-3">
        <span className="bg-brand-soft text-brand grid size-10 shrink-0 place-items-center rounded-xl">
          <UserRoundCheck className="size-5" />
        </span>
        <AppText type="caption" className="text-muted-foreground block text-sm">
          Everything is exactly as you left it - your profile, history and
          settings. Reactivate your account to pick up where you stopped.
        </AppText>
      </div>
    </AppDialog>
  );
};
