"use client";

import { FormInput } from "@/components/form/form-input";
import { FormSelect } from "@/components/form/form-select";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { useOnboardingProfile } from "@/hooks/use-onboarding-profile";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  ACADEMIC_LEVEL_OPTIONS,
  ONBOARDING_TIPS,
} from "@/lib/utils";
import { GraduationCap } from "lucide-react";
import {
  academicQualificationSchema,
  type AcademicQualificationFormValues,
} from "@/schemas/onboarding/steps";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { StepHeader } from "../_components/step-header";
import { StepPanel } from "../_components/step-panel";
import { useSaveOnboardingStep } from "../_hooks/use-save-onboarding-step";

export default function AcademicQualificationStep() {
  const { profile } = useOnboardingProfile();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AcademicQualificationFormValues>({
    resolver: zodResolver(academicQualificationSchema),
  });

  useEffect(() => {
    if (!profile) return;

    reset({
      academic_level: profile.academic_level ?? undefined,
      institution: profile.institution ?? "",
      course_of_study: profile.course_of_study ?? "",
    });
  }, [profile, reset]);

  const { save, isPending } =
    useSaveOnboardingStep<AcademicQualificationFormValues>({
      url: API_ENDPOINTS.driverOnboarding.academicQualification,
      redirectTo: "/driver/onboarding/work-experience",
      onSuccessMessage: "Academic qualification saved",
    });

  return (
    <OnboardingShell
      step="ACADEMIC_QUALIFICATION"
      tips={ONBOARDING_TIPS.ACADEMIC_QUALIFICATION}
      footer={{ label: "Continue", formId: "step-form", isLoading: isPending, hint: "Not required - it just rounds out your profile" }}
    >
      <StepHeader step="ACADEMIC_QUALIFICATION" title="Your education" description="Add your highest level of education. It isn't required, but it helps build a fuller profile." />

      <form id="step-form" onSubmit={handleSubmit((data) => save(data))}>
        <StepPanel title="Highest qualification" icon={GraduationCap}>
        <div className="grid gap-4 sm:grid-cols-2">
        <FormSelect<AcademicQualificationFormValues>
          control={control}
          name="academic_level"
          errors={errors}
          label="Academic level"
          placeholder="E.g Secondary School"
          options={ACADEMIC_LEVEL_OPTIONS}
        />

        <FormInput<AcademicQualificationFormValues>
          control={control}
          name="institution"
          errors={errors}
          label="What school did you attend?"
          placeholder="E.g University of Lagos"
        />

        <FormInput<AcademicQualificationFormValues>
          control={control}
          name="course_of_study"
          errors={errors}
          label="What course did you study?"
          placeholder="E.g Medicine"
        />

        </div>
        </StepPanel>
      </form>
    </OnboardingShell>
  );
}
