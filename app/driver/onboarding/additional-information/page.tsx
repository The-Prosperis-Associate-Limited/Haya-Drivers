"use client";

import { FormInput } from "@/components/form/form-input";
import { FormMultiSelect } from "@/components/form/form-multi-select";
import { FormSelect } from "@/components/form/form-select";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { useOnboardingProfile } from "@/hooks/use-onboarding-profile";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  ETHNICITY_OPTIONS,
  LANGUAGE_OPTIONS,
  ONBOARDING_TIPS,
  RELIGION_OPTIONS,
} from "@/lib/utils";
import { Languages } from "lucide-react";
import Link from "next/link";
import {
  additionalInformationSchema,
  type AdditionalInformationFormValues,
} from "@/schemas/onboarding/steps";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { StepHeader } from "../_components/step-header";
import { StepPanel } from "../_components/step-panel";
import { useSaveOnboardingStep } from "../_hooks/use-save-onboarding-step";

export default function AdditionalInformationStep() {
  const { profile } = useOnboardingProfile();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdditionalInformationFormValues>({
    resolver: zodResolver(additionalInformationSchema),
    defaultValues: { languages: [] },
  });

  useEffect(() => {
    if (!profile) return;

    reset({
      language_count: profile.language_count ?? undefined,
      languages: profile.languages ?? [],
      religion: profile.religion ?? "",
      ethnicity: profile.ethnicity ?? "",
    });
  }, [profile, reset]);

  const { save, isPending } =
    useSaveOnboardingStep<AdditionalInformationFormValues>({
      url: API_ENDPOINTS.driverOnboarding.additionalInformation,
      redirectTo: "/driver/onboarding/documents",
      onSuccessMessage: "Saved",
    });

  return (
    <OnboardingShell
      step="ADDITIONAL_INFORMATION"
      tips={ONBOARDING_TIPS.ADDITIONAL_INFORMATION}
      footer={{
        label: "Continue",
        formId: "step-form",
        isLoading: isPending,
        hint: "Everything here is optional",
        secondary: (
          <Link href="/driver/onboarding/documents" className="text-muted-foreground hover:text-foreground px-2 text-sm font-semibold">
            Skip
          </Link>
        ),
      }}
    >
      <StepHeader step="ADDITIONAL_INFORMATION" title="A little more about you" description="Optional - some clients look for a driver who speaks their language." />

      <form id="step-form" onSubmit={handleSubmit((data) => save(data))}>
        <StepPanel title="Languages and background" icon={Languages}>
        <div className="grid gap-4 sm:grid-cols-2">
        <FormInput<AdditionalInformationFormValues>
          control={control}
          name="language_count"
          errors={errors}
          label="How many languages can you speak?"
          placeholder="E.g 4"
          type="number"
          min={0}
        />

        <FormMultiSelect<AdditionalInformationFormValues>
          control={control}
          name="languages"
          errors={errors}
          label="Select the languages"
          placeholder="E.g Hausa"
          options={LANGUAGE_OPTIONS}
        />

        <FormSelect<AdditionalInformationFormValues>
          control={control}
          name="religion"
          errors={errors}
          label="Your religion"
          placeholder="E.g Christianity"
          options={RELIGION_OPTIONS}
        />

        <FormSelect<AdditionalInformationFormValues>
          control={control}
          name="ethnicity"
          errors={errors}
          label="Your ethnicity"
          placeholder="E.g Yoruba"
          options={ETHNICITY_OPTIONS}
        />

        </div>
        </StepPanel>
      </form>
    </OnboardingShell>
  );
}
