"use client";

import { useOnboardingProfile } from "@/hooks/use-onboarding-profile";
import { getOnboardingPath } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingEntry() {
  const router = useRouter();
  const { profile, isFetching } = useOnboardingProfile();

  useEffect(() => {
    if (!profile) return;

    if (profile.verification_status !== "UNSUBMITTED") {
      return router.replace("/driver/onboarding/status");
    }

    router.replace(getOnboardingPath(profile.onboarding_step));
  }, [profile, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      {isFetching && <Loader2 className="text-brand h-7 w-7 animate-spin" />}
    </div>
  );
}
