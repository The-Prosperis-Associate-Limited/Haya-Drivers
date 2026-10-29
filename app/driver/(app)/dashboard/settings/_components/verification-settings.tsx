"use client";

import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  VerificationReview,
  getVerificationReadiness,
} from "@/components/verification/verification-review";
import { useOnboardingProfile } from "@/hooks/use-onboarding-profile";
import { useVerificationStatus } from "@/hooks/use-verification-status";
import { VERIFICATION_COPY } from "@/lib/utils";
import { CheckCircle2, CircleAlert, Info } from "lucide-react";
import { useGetDocuments } from "@/hooks/use-documents";
import { useSubmitOnboarding } from "@/hooks/use-submit-onboarding";

export const VerificationSettings = function () {
  const { profile, isFetching } = useOnboardingProfile();
  const { documents } = useGetDocuments();
  const { verification } = useVerificationStatus();

  const { submitOnboarding, isPending } = useSubmitOnboarding({
    redirect: false,
  });

  const status = verification?.status ?? profile?.verification_status;
  const isSubmitted = status === "PENDING" || status === "APPROVED";
  const { canSubmit } = getVerificationReadiness(profile, documents);

  if (isFetching && !profile) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }

  const rejected = verification?.rejected_documents ?? [];

  return (
    <div className="space-y-4">
      {status === "REJECTED" &&
        (rejected.length ? (
          rejected.map((document) => (
            <div
              key={document.id}
              className="border-destructive/30 flex items-start gap-2.5 rounded-xl border bg-red-50 p-4"
            >
              <CircleAlert className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
              <AppText type="caption" className="text-destructive">
                {/* The reviewer wrote this for the driver - never reworded. */}
                {document.label}:{" "}
                {document.reason ?? "Please re-upload this document."}
              </AppText>
            </div>
          ))
        ) : (
          <div className="border-destructive/30 flex items-start gap-2.5 rounded-xl border bg-red-50 p-4">
            <CircleAlert className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
            <AppText type="caption" className="text-destructive">
              {verification?.rejection_reason ??
                VERIFICATION_COPY.REJECTED.headline}
            </AppText>
          </div>
        ))}

      {status === "PENDING" && (
        <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <AppText type="caption" className="text-blue-700">
            {VERIFICATION_COPY.PENDING.headline}
          </AppText>
        </div>
      )}

      {status === "APPROVED" && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <AppText type="caption" className="text-emerald-700">
            {VERIFICATION_COPY.APPROVED.headline} across{" "}
            {profile?.user?.state_of_residence ?? "your state"}.
          </AppText>
        </div>
      )}

      <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-6">
        <AppText type="h3" className="text-[15px] font-semibold">
          {isSubmitted ? "What you submitted" : "Review before you submit"}
        </AppText>
        <AppText
          type="caption"
          className="text-muted-foreground mt-1 mb-5 block"
        >
          {isSubmitted
            ? "Everything a reviewer sees. Edit a section to change what you sent."
            : "Check everything below. Submission is blocked until all required items are complete."}
        </AppText>

        <VerificationReview profile={profile} documents={documents} />

        {(status === "UNSUBMITTED" || status === "REJECTED") && (
          <Button
            isLoading={isPending}
            disabled={!canSubmit}
            onClick={() => submitOnboarding({})}
            className="mt-4 h-11 rounded-lg px-6"
          >
            {status === "REJECTED"
              ? "Resubmit for review"
              : "Submit for review"}
          </Button>
        )}
      </div>
    </div>
  );
};
