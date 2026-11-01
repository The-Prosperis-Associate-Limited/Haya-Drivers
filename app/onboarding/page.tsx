"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CLIENT_ONBOARDING_STEPS } from "@/lib/utils";
import { usePreferences } from "./_hooks/use-preferences";

export default function OnboardingEntry() {
  const router = useRouter();
  const { preferences } = usePreferences();

  useEffect(() => {
    if (!preferences) return;

    router.replace(
      preferences.onboarding_completed_at
        ? "/dashboard"
        : CLIENT_ONBOARDING_STEPS[0].path,
    );
  }, [preferences, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="text-brand h-7 w-7 animate-spin" />
    </div>
  );
}
