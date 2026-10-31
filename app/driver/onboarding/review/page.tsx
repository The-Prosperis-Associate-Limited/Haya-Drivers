"use client";

import { ReferralAttachCard } from "@/components/driver/referral-attach-card";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { Button } from "@/components/ui/button";
import {
  VerificationReview,
  getVerificationReadiness,
} from "@/components/verification/verification-review";
import { useOnboardingProfile } from "@/hooks/use-onboarding-profile";
import { ONBOARDING_TIPS, getOnboardingProgress } from "@/lib/utils";
import { showToast } from "@/lib/show-toast";
import { useRouter } from "next/navigation";
import { StepHeader } from "../_components/step-header";
import { useGetDocuments } from "@/hooks/use-documents";
import { useSubmitOnboarding } from "@/hooks/use-submit-onboarding";

export default function ReviewStep() {
  const router = useRouter();
  const { profile } = useOnboardingProfile();
  const { documents } = useGetDocuments();

  const { submitOnboarding, isPending } = useSubmitOnboarding();

  const { canSubmit } = getVerificationReadiness(profile, documents);

  // Every step saves as it goes, so a driver already under review or verified is only editing - there is nothing to submit again.
  const alreadySubmitted =
    profile?.verification_status === "PENDING" ||
    profile?.verification_status === "APPROVED";

  const finish = () => {
    if (!alreadySubmitted) return submitOnboarding({});

    showToast("success", "Your changes are saved");
    router.push("/driver/dashboard");
  };

  return (
    <OnboardingShell
      title={`Welcome ${profile?.user?.first_name ?? "there"} 👋`}
      subtitle="Let's get your account fully set up. A few quick steps stand between you and your first job."
      tips={ONBOARDING_TIPS.REVIEW}
    >
      <StepHeader
        title={
          alreadySubmitted ? "Review your details" : "Review before you submit"
        }
        description={
          alreadySubmitted
            ? profile?.verification_status === "APPROVED"
              ? "You're verified - your changes are already saved. Documents can only be changed through support."
              : "Your application is with our team - your changes are already saved and they'll see them."
            : "Check everything below. Submission is blocked until all required items are complete."
        }
        progress={getOnboardingProgress("REVIEW")}
      />

      <VerificationReview profile={profile} documents={documents} />

      {profile?.verification_status === "UNSUBMITTED" && (
        <div className="mt-4">
          <ReferralAttachCard />
        </div>
      )}

      <Button
        isLoading={isPending}
        disabled={!alreadySubmitted && !canSubmit}
        onClick={finish}
        className="mt-4 h-12 w-full rounded-lg text-sm"
      >
        {alreadySubmitted ? "Save and finish" : "Submit for review"}
      </Button>
    </OnboardingShell>
  );
}
