"use client";

import { FormChoiceChips } from "@/components/form/form-choices";
import { FormInput } from "@/components/form/form-input";
import { FormPhoneInput } from "@/components/form/form-phone-input";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { useOnboardingProfile } from "@/hooks/use-onboarding-profile";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { DEFAULT_GUARANTOR, DEFAULT_REFERENCE, GUARANTOR_RELATIONSHIP_OPTIONS, ONBOARDING_TIPS } from "@/lib/utils";
import { guarantorSchema, type GuarantorFormValues } from "@/schemas/onboarding/steps";
import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseBusiness, Info, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { StepHeader } from "../_components/step-header";
import { StepNote, StepPanel } from "../_components/step-panel";
import { useSaveOnboardingStep } from "../_hooks/use-save-onboarding-step";

export default function GuarantorsStep() {
  const { profile } = useOnboardingProfile();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GuarantorFormValues>({
    resolver: zodResolver(guarantorSchema),
    defaultValues: {
      reference: DEFAULT_REFERENCE,
      guarantors: [DEFAULT_GUARANTOR as never],
    },
  });

  useEffect(() => {
    if (!profile) return;

    // Only the first saved guarantor carries over - the step now takes exactly one.
    const saved = profile.guarantors[0];

    reset({
      reference: {
        full_name: profile.reference?.full_name ?? "",
        company_name: profile.reference?.company_name ?? "",
        phone_no: profile.reference?.phone_no ?? "",
      },
      guarantors: [
        saved
          ? {
              full_name: saved.full_name,
              relationship: saved.relationship as GuarantorFormValues["guarantors"][number]["relationship"],
              phone_no: saved.phone_no,
              address: saved.address,
              nin: saved.nin,
            }
          : (DEFAULT_GUARANTOR as never),
      ],
    });
  }, [profile, reset]);

  const { save, isPending } = useSaveOnboardingStep<GuarantorFormValues>({
    url: API_ENDPOINTS.driverOnboarding.guarantors,
    redirectTo: "/driver/onboarding/additional-information",
    onSuccessMessage: "Reference and guarantor saved",
  });

  return (
    <OnboardingShell
      step="GUARANTORS"
      tips={ONBOARDING_TIPS.GUARANTORS}
      footer={{ label: "Continue", formId: "step-form", isLoading: isPending, hint: "Saved when you continue" }}
    >
      <StepHeader
        step="GUARANTORS"
        title="Who can vouch for you?"
        description="A guarantor is a working professional who isn't a relative or friend. A reference is someone you've driven for."
      />

      <form id="step-form" onSubmit={handleSubmit((data) => save(data))} className="space-y-3.5">
        <StepPanel title="Your guarantor" description="We'll call them to confirm - let them know to expect it" icon={ShieldCheck}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput<GuarantorFormValues> control={control} name="guarantors.0.full_name" errors={errors} label="Full name" placeholder="E.g John Levy" />
            <FormPhoneInput<GuarantorFormValues> control={control} name="guarantors.0.phone_no" errors={errors} label="Phone number" />
            <FormChoiceChips<GuarantorFormValues>
              control={control}
              name="guarantors.0.relationship"
              errors={errors}
              label="Who are they to you?"
              options={GUARANTOR_RELATIONSHIP_OPTIONS}
              className="sm:col-span-2"
            />
            <FormInput<GuarantorFormValues> control={control} name="guarantors.0.nin" errors={errors} label="NIN" placeholder="E.g 12345678901" inputMode="numeric" />
            <FormInput<GuarantorFormValues> control={control} name="guarantors.0.address" errors={errors} label="Address" placeholder="E.g 12 Bode Thomas, Surulere" />
          </div>
          <div className="mt-4">
            <StepNote icon={Info}>
              Must be a civil servant (grade level 8 or above) or a business owner. You&apos;ll upload their passport photo and NIN slip on the documents step.
            </StepNote>
          </div>
        </StepPanel>

        <StepPanel title="Previous employer reference" description="Someone you've driven for who can speak to your work" icon={BriefcaseBusiness}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput<GuarantorFormValues> control={control} name="reference.full_name" errors={errors} label="Full name" placeholder="E.g Adaeze Nwosu" />
            <FormPhoneInput<GuarantorFormValues> control={control} name="reference.phone_no" errors={errors} label="Phone number" />
            <FormInput<GuarantorFormValues>
              control={control}
              name="reference.company_name"
              errors={errors}
              label="Company or household (optional)"
              placeholder="E.g Meridian Logistics"
              containerClassName="sm:col-span-2"
            />
          </div>
        </StepPanel>
      </form>
    </OnboardingShell>
  );
}
