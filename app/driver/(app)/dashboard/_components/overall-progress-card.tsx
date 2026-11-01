"use client";

import { AppText } from "@/components/shared/app-text";
import { useOnboardingProfile } from "@/hooks/use-onboarding-profile";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getOnboardingPath, getOnboardingProgress } from "@/lib/utils";
import Link from "next/link";
import type { DriverVerificationStatus } from "@/types/driver";

interface Props {
  status: DriverVerificationStatus;
}

const COPY: Record<DriverVerificationStatus, string> = {
  UNSUBMITTED:
    "Applying as Driver. Your profile stays private and unsearchable until identity, licence and criminal-record checks are complete.",
  PENDING:
    "Application submitted. Your profile stays private and unsearchable until identity, licence and criminal-record checks are complete.",
  REJECTED:
    "Two documents need another look. Fix them and resubmit - the rest of your application stands.",
  APPROVED: "",
};

export const OverallProgressCard = function ({ status }: Props) {
  const { profile } = useOnboardingProfile();

  if (status === "APPROVED") return null;

  const progress =
    status === "UNSUBMITTED"
      ? getOnboardingProgress(profile?.onboarding_step)
      : 100;

  return (
    <div className="bg-brand rounded-xl p-5 text-white md:p-6">
      <AppText
        type="caption"
        className="block font-semibold tracking-wide text-white/80 uppercase"
      >
        Overall progress
      </AppText>

      <AppText
        type="h2"
        className="mt-3 text-3xl font-semibold text-white"
        as="p"
      >
        {progress}%
      </AppText>

      <Progress
        value={progress}
        aria-label="Onboarding progress"
        className="mt-4 bg-white/30"
        indicatorClassName="bg-white"
      />

      <AppText type="caption" className="mt-4 block text-white/90">
        {COPY[status]}
      </AppText>

      {status === "UNSUBMITTED" && (
        <Button
          asChild
          variant="ghost"
          className="text-brand mt-5 h-11 rounded-lg bg-white px-6 hover:bg-white/90"
        >
          <Link href={getOnboardingPath(profile?.onboarding_step)}>
            Continue setup
          </Link>
        </Button>
      )}
    </div>
  );
};
