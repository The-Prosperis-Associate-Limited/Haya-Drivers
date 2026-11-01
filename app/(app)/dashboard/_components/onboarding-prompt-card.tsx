"use client";

import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CLIENT_ONBOARDING_STEPS } from "@/lib/utils";
import Link from "next/link";
import type { ClientProfile } from "@/types/auth";

interface Props {
  clientProfile: ClientProfile | null;
}

export const OnboardingPromptCard = function ({ clientProfile }: Props) {
  if (clientProfile?.onboarding_completed_at) return null;

  const answered = [
    (clientProfile?.hiring_categories.length ?? 0) > 0,
    Boolean(clientProfile?.drivers_needed && clientProfile?.assignment_type),
    Boolean(clientProfile?.primary_location && clientProfile?.hiring_timeline),
    Boolean(clientProfile?.monthly_budget),
  ];
  const answeredCount = answered.filter(Boolean).length;

  const progress =
    answeredCount === 0
      ? 0
      : Math.round(
          ((answeredCount + 1) / CLIENT_ONBOARDING_STEPS.length) * 100,
        );

  const firstMissing = answered.indexOf(false);
  const resumePath =
    answeredCount === 0
      ? CLIENT_ONBOARDING_STEPS[0].path
      : CLIENT_ONBOARDING_STEPS[
          firstMissing === -1
            ? CLIENT_ONBOARDING_STEPS.length - 1
            : firstMissing + 1
        ].path;

  return (
    <div className="bg-brand mt-6 rounded-xl p-5 text-white md:p-6">
      <AppText
        type="caption"
        className="block font-semibold tracking-wide text-white/80 uppercase"
      >
        Set up your hiring preferences
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
        Tell us how you plan to hire - driver categories, capacity, location and
        budget - so every match we surface is personalised from day one.
      </AppText>

      <Button
        asChild
        variant="ghost"
        className="text-brand mt-5 h-11 rounded-lg bg-white px-6 hover:bg-white/90"
      >
        <Link href={resumePath}>
          {answeredCount === 0 ? "Get started" : "Continue setup"}
        </Link>
      </Button>
    </div>
  );
};
