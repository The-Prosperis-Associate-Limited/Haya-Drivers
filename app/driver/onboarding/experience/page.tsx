"use client";

import {
  FormChoiceChips,
  FormNumberStepper,
  FormOptionCards,
} from "@/components/form/form-choices";
import { FormDatePicker } from "@/components/form/form-date-picker";
import { FormInput } from "@/components/form/form-input";
import {
  FormTimePicker,
  displayTime,
} from "@/components/form/form-time-picker";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { useOnboardingProfile } from "@/hooks/use-onboarding-profile";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  LICENCE_CLASS_OPTIONS,
  ONBOARDING_TIPS,
  toMajorUnits,
  toMinorUnits,
} from "@/lib/utils";
import {
  experienceSchema,
  type ExperienceFormValues,
} from "@/schemas/onboarding/steps";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Car,
  Clock,
  House,
  IdCard,
  Lock,
  MapPin,
  Package,
  Truck,
  Wallet,
} from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { StepHeader } from "../_components/step-header";
import { StepPanel } from "../_components/step-panel";
import { useSaveOnboardingStep } from "../_hooks/use-save-onboarding-step";

const DRIVER_TYPES = [
  {
    value: "PRIVATE_DRIVER",
    label: "Private driver",
    description: "Families and individuals",
    icon: House,
  },
  {
    value: "CORPORATE_DRIVER",
    label: "Corporate driver",
    description: "Executives and company staff",
    icon: Building2,
  },
  {
    value: "LOGISTICS_DRIVER",
    label: "Logistics driver",
    description: "Vans, deliveries and dispatch",
    icon: Package,
  },
  {
    value: "RIDE_HAILING_DRIVER",
    label: "Ride-hailing driver",
    description: "Bolt, Uber, inDrive",
    icon: MapPin,
  },
  {
    value: "HEAVY_DUTY_DRIVER",
    label: "Heavy-duty driver",
    description: "Trucks, tankers, buses",
    icon: Truck,
  },
];

const TRANSMISSIONS = [
  { value: "MANUAL", label: "Manual" },
  { value: "AUTOMATIC", label: "Automatic" },
  { value: "BOTH", label: "Both" },
];

const DAY_RANGES = ["Mon - Fri", "Mon - Sat", "Every day", "Weekends"];

// Settings stores times as typed text ("8:00 AM"); the picker wants "HH:mm", so anything unreadable starts blank.
const toPickerTime = function (value?: string) {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(value?.trim() ?? "");
  if (!match) return "";
  const hour =
    (Number(match[1]) % 12) + (match[3].toUpperCase() === "PM" ? 12 : 0);
  return `${String(hour).padStart(2, "0")}:${match[2]}`;
};

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

  const savedSlots = profile?.availability ?? [];
  const dayRanges =
    savedSlots[0] && !DAY_RANGES.includes(savedSlots[0].day_range)
      ? [...DAY_RANGES, savedSlots[0].day_range]
      : DAY_RANGES;

  useEffect(() => {
    if (!profile) return;

    const firstSlot = profile.availability?.[0];

    reset({
      years_of_experience:
        profile.years_of_experience != null
          ? Math.min(profile.years_of_experience, 30)
          : (undefined as unknown as number),
      driver_type: profile.driver_type ?? undefined,
      transmission: profile.transmission ?? undefined,
      licence_classes: profile.licence_classes ?? [],
      license_number: profile.license_number ?? "",
      license_expires_at: profile.license_expires_at?.slice(0, 10) ?? "",
      expected_monthly_rate: profile.expected_monthly_rate
        ? String(toMajorUnits(profile.expected_monthly_rate))
        : "",
      day_range: firstSlot?.day_range ?? "",
      work_start: toPickerTime(firstSlot?.start),
      work_end: toPickerTime(firstSlot?.end),
    });
  }, [profile, reset]);

  const { save, isPending } = useSaveOnboardingStep<Record<string, unknown>>({
    url: API_ENDPOINTS.driverOnboarding.experience,
    redirectTo: "/driver/onboarding/academic-qualification",
    onSuccessMessage: "Experience saved",
  });

  return (
    <OnboardingShell
      step="EXPERIENCE"
      tips={ONBOARDING_TIPS.EXPERIENCE}
      footer={{
        label: "Continue",
        formId: "step-form",
        isLoading: isPending,
        hint: "Saved when you continue",
      }}
    >
      <StepHeader
        step="EXPERIENCE"
        title="Tell clients how you drive"
        description="Every stage of experience is valued. Pick what fits - you can change it later."
      />

      <form
        id="step-form"
        onSubmit={handleSubmit(
          ({
            expected_monthly_rate,
            day_range,
            work_start,
            work_end,
            ...rest
          }) =>
            save({
              ...rest,
              expected_monthly_rate: toMinorUnits(
                Number(expected_monthly_rate),
              ),
              // Extra slots added later in Settings are kept; onboarding only edits the first.
              availability: [
                {
                  day_range,
                  start: displayTime(work_start),
                  end: displayTime(work_end),
                },
                ...savedSlots.slice(1),
              ],
            }),
        )}
        className="space-y-3.5"
      >
        <StepPanel
          title="What kind of driving do you do?"
          description="Pick your main one"
          icon={Car}
        >
          <FormOptionCards<ExperienceFormValues>
            control={control}
            name="driver_type"
            errors={errors}
            options={DRIVER_TYPES}
          />
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
              format={(value) =>
                value === 0
                  ? "Under 1 year"
                  : value === 30
                    ? "30+ years"
                    : `${value} year${value === 1 ? "" : "s"}`
              }
            />
            <FormChoiceChips<ExperienceFormValues>
              control={control}
              name="transmission"
              errors={errors}
              label="Transmission"
              options={TRANSMISSIONS}
            />
          </div>

          <FormChoiceChips<ExperienceFormValues>
            control={control}
            name="licence_classes"
            errors={errors}
            multiple
            className="mt-5"
            label={
              <>
                Licence classes{" "}
                <span className="font-normal text-slate-400">
                  (select all on your licence)
                </span>
              </>
            }
            options={LICENCE_CLASS_OPTIONS.map((option) => ({
              value: option.value,
              label: option.value,
              description: SHORT_CLASS[option.value] ?? option.description,
            }))}
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
            <FormInput<ExperienceFormValues>
              control={control}
              name="license_number"
              errors={errors}
              label="Licence number"
              placeholder="E.g ABC123456789"
            />
            {/* The team requires a licence with at least a year left to run. */}
            <FormDatePicker<ExperienceFormValues>
              control={control}
              mode="single"
              name="license_expires_at"
              errors={errors}
              label="Expiry date"
              captionLayout="dropdown"
              minDate={
                new Date(new Date().setFullYear(new Date().getFullYear() + 1))
              }
            />
          </div>
        </StepPanel>

        <StepPanel
          title="Your monthly rate"
          description="What you expect to earn in a month of full-time work"
          icon={Wallet}
        >
          <div className="max-w-sm">
            <FormInput<ExperienceFormValues>
              control={control}
              name="expected_monthly_rate"
              errors={errors}
              label="Expected monthly rate (₦)"
              placeholder="E.g 250000"
              inputMode="numeric"
              suffix="/ month"
            />
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            Clients filter by budget, so a realistic rate puts you in front of
            the right ones. You can change it later in Settings.
          </p>
        </StepPanel>

        <StepPanel
          title="Your working hours"
          description="When you are usually available to drive"
          icon={Clock}
        >
          <FormChoiceChips<ExperienceFormValues>
            control={control}
            name="day_range"
            errors={errors}
            label="Days"
            options={dayRanges.map((range) => ({ value: range, label: range }))}
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <FormTimePicker<ExperienceFormValues>
              control={control}
              name="work_start"
              errors={errors}
              label="From"
            />
            <FormTimePicker<ExperienceFormValues>
              control={control}
              name="work_end"
              errors={errors}
              label="To"
            />
          </div>
          {savedSlots.length > 1 && (
            <p className="text-muted-foreground mt-3 text-xs">
              Your other {savedSlots.length - 1} slot
              {savedSlots.length === 2 ? "" : "s"} from Settings stay as they
              are.
            </p>
          )}
        </StepPanel>
      </form>
    </OnboardingShell>
  );
}
