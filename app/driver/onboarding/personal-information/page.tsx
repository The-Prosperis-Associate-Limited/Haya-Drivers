"use client";

import { FormChoiceChips } from "@/components/form/form-choices";
import { FormDatePicker } from "@/components/form/form-date-picker";
import { FormPhoneInput } from "@/components/form/form-phone-input";
import { FormSelect } from "@/components/form/form-select";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { useLocationOptions } from "@/hooks/use-location-options";
import { useOnboardingProfile } from "@/hooks/use-onboarding-profile";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, ONBOARDING_TIPS } from "@/lib/utils";
import { personalInformationSchema, type PersonalInformationFormValues } from "@/schemas/onboarding/steps";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, UserRound } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { StepHeader } from "../_components/step-header";
import { StepPanel } from "../_components/step-panel";
import { useSaveOnboardingStep } from "../_hooks/use-save-onboarding-step";

export default function PersonalInformationStep() {
  const { profile } = useOnboardingProfile();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalInformationFormValues>({
    resolver: zodResolver(personalInformationSchema),
  });

  const country = useWatch({ control, name: "country" });
  const { countries, states } = useLocationOptions(country);

  useEffect(() => {
    if (!profile) return;

    reset({
      phone_no: profile.user.phone_no ?? "",
      // OTHER predates this field being asked; treat it as unanswered.
      gender: profile.user.gender === "MALE" || profile.user.gender === "FEMALE" ? profile.user.gender : undefined,
      marital_status: profile.user.marital_status ?? undefined,
      date_of_birth: profile.user.date_of_birth?.slice(0, 10) ?? "",
      country: profile.user.country ?? "",
      state_of_residence: profile.user.state_of_residence ?? "",
      state_of_origin: profile.state_of_origin ?? "",
    });
  }, [profile, reset]);

  const { save, isPending } = useSaveOnboardingStep<PersonalInformationFormValues>({
    url: API_ENDPOINTS.driverOnboarding.personalInformation,
    redirectTo: "/driver/onboarding/experience",
    onSuccessMessage: "Personal information saved",
  });

  return (
    <OnboardingShell
      step="PERSONAL_INFORMATION"
      tips={ONBOARDING_TIPS.PERSONAL_INFORMATION}
      footer={{ label: "Continue", formId: "step-form", isLoading: isPending, hint: "Saved when you continue", hideBack: true }}
    >
      <StepHeader step="PERSONAL_INFORMATION" title="Let's start with you" description="The foundation of your driver profile. It takes about a minute." />

      <form id="step-form" onSubmit={handleSubmit((data) => save(data))} className="space-y-3.5">
        <StepPanel title="About you" description="Matched against your NIN slip" icon={UserRound}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormPhoneInput<PersonalInformationFormValues> control={control} name="phone_no" errors={errors} label="Phone number" />
            {/* Eighteen years back - the schema refuses younger anyway. */}
            <FormDatePicker<PersonalInformationFormValues>
              control={control}
              mode="single"
              name="date_of_birth"
              errors={errors}
              label="Date of birth"
              captionLayout="dropdown"
              maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
            />
            <FormChoiceChips<PersonalInformationFormValues> control={control} name="gender" errors={errors} label="Gender" options={GENDER_OPTIONS} />
            <FormChoiceChips<PersonalInformationFormValues> control={control} name="marital_status" errors={errors} label="Marital status" options={MARITAL_STATUS_OPTIONS} />
          </div>
        </StepPanel>

        <StepPanel title="Where you live" description="Clients search for drivers near them" icon={MapPin}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelect<PersonalInformationFormValues> control={control} name="country" errors={errors} label="Country" placeholder="E.g Nigeria" options={countries} />
            <FormSelect<PersonalInformationFormValues>
              control={control}
              name="state_of_residence"
              errors={errors}
              label="State you live in"
              placeholder="E.g Lagos State"
              options={states}
              disabled={!country}
            />
            <FormSelect<PersonalInformationFormValues>
              control={control}
              name="state_of_origin"
              errors={errors}
              label="State of origin"
              placeholder="E.g Imo State"
              options={states}
              disabled={!country}
            />
          </div>
        </StepPanel>
      </form>
    </OnboardingShell>
  );
}
