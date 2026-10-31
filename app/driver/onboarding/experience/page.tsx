"use client";

import { FormChoiceChips, FormNumberStepper, FormOptionCards } from "@/components/form/form-choices";
import { FormDatePicker } from "@/components/form/form-date-picker";
import { FormInput } from "@/components/form/form-input";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { useOnboardingProfile } from "@/hooks/use-onboarding-profile";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { LICENCE_CLASS_OPTIONS, ONBOARDING_TIPS } from "@/lib/utils";
import { experienceSchema, type ExperienceFormValues } from "@/schemas/onboarding/steps";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Car, House, IdCard, Lock, MapPin, Package, Truck } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { StepHeader } from "../_components/step-header";
import { StepPanel } from "../_components/step-panel";
import { useSaveOnboardingStep } from "../_hooks/use-save-onboarding-step";

const DRIVER_TYPES = [
  { value: "PRIVATE_DRIVER", label: "Private driver", description: "Families and individuals", icon: House },
  { value: "CORPORATE_DRIVER", label: "Corporate driver", description: "Executives and company staff", icon: Building2 },
  { value: "LOGISTICS_DRIVER", label: "Logistics driver", description: "Vans, deliveries and dispatch", icon: Package },
  { value: "RIDE_HAILING_DRIVER", label: "Ride-hailing driver", description: "Bolt, Uber, inDrive", icon: MapPin },
  { value: "HEAVY_DUTY_DRIVER", label: "Heavy-duty driver", description: "Trucks, tankers, buses", icon: Truck },
];

const TRANSMISSIONS = [
  { value: "MANUAL", label: "Manual" },
  { value: "AUTOMATIC", label: "Automatic" },
  { value: "BOTH", label: "Both" },
];

const SHORT_CLASS: Record<string, string> = {
  A: "Motorcycle",
  B: "Car",
  C: "Light van",
  D: "Bus",
  E: "Heavy goods",
  F: "Agric",
  G: "Articulated",
  H: "Earth-moving",
  J: "Special",
};

export default function ExperienceStep() {
  const { profile } = useOnboardingProfile();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: { licence_classes: [] },
  });

  useEffect(() => {
    if (!profile) return;

    reset({
      years_of_experience: profile.years_of_experience != null ? Math.min(profile.years_of_experience, 30) : (undefined as unknown as number),
      driver_type: profile.driver_type ?? undefined,
      transmission: profile.transmission ?? undefined,
      licence_classes: profile.licence_classes ?? [],
      license_number: profile.license_number ?? "",
      license_expires_at: profile.license_expires_at?.slice(0, 10) ?? "",
    });
  }, [profile, reset]);

  const { save, isPending } = useSaveOnboardingStep<ExperienceFormValues>({
    url: API_ENDPOINTS.driverOnboarding.experience,
    redirectTo: "/driver/onboarding/academic-qualification",
    onSuccessMessage: "Experience saved",
  });

  return (
    <OnboardingShell
      step="EXPERIENCE"
      tips={ONBOARDING_TIPS.EXPERIENCE}
      footer={{ label: "Continue", formId: "step-form", isLoading: isPending, hint: "Saved when you continue" }}
    >
      <StepHeader step="EXPERIENCE" title="Tell clients how you drive" description="Every stage of experience is valued. Pick what fits - you can change it later." />

      <form id="step-form" onSubmit={handleSubmit((data) => save(data))} className="space-y-3.5">
        <StepPanel title="What kind of driving do you do?" description="Pick your main one" icon={Car}>
          <FormOptionCards<ExperienceFormValues> control={control} name="driver_type" errors={errors} options={DRIVER_TYPES} />
        </StepPanel>

        <StepPanel>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormNumberStepper<ExperienceFormValues>
              control={control}
              name="years_of_experience"
              errors={errors}
              label="Years of experience"
              min={0}
              max={30}
              format={(value) => (value === 0 ? "Under 1 year" : value === 30 ? "30+ years" : `${value} year${value === 1 ? "" : "s"}`)}
            />
            <FormChoiceChips<ExperienceFormValues> control={control} name="transmission" errors={errors} label="Transmission" options={TRANSMISSIONS} />
          </div>

          <FormChoiceChips<ExperienceFormValues>
            control={control}
            name="licence_classes"
            errors={errors}
            multiple
            className="mt-5"
            label={
              <>
                Licence classes <span className="font-normal text-slate-400">(select all on your licence)</span>
              </>
            }
            options={LICENCE_CLASS_OPTIONS.map((option) => ({ value: option.value, label: option.value, description: SHORT_CLASS[option.value] ?? option.description }))}
          />
        </StepPanel>

        <StepPanel
          title="Your driver's licence"
          description="We check this with the FRSC"
          icon={IdCard}
          aside={
            <span className="border-border inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] font-medium">
              <Lock className="size-3" />
              Private
            </span>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput<ExperienceFormValues> control={control} name="license_number" errors={errors} label="Licence number" placeholder="E.g ABC123456789" />
            {/* The team requires a licence with at least a year left to run. */}
            <FormDatePicker<ExperienceFormValues>
              control={control}
              mode="single"
              name="license_expires_at"
              errors={errors}
              label="Expiry date"
              captionLayout="dropdown"
              minDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
            />
          </div>
        </StepPanel>
      </form>
    </OnboardingShell>
  );
}
