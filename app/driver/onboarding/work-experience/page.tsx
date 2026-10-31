"use client";

import { FormInput } from "@/components/form/form-input";
import { FormDatePicker } from "@/components/form/form-date-picker";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingProfile } from "@/hooks/use-onboarding-profile";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  DEFAULT_WORK_EXPERIENCE,
  ONBOARDING_TIPS,
} from "@/lib/utils";
import {
  workExperienceSchema,
  type WorkExperienceFormValues,
} from "@/schemas/onboarding/steps";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { StepHeader } from "../_components/step-header";
import { StepPanel } from "../_components/step-panel";
import { useSaveOnboardingStep } from "../_hooks/use-save-onboarding-step";

export default function WorkExperienceStep() {
  const { profile } = useOnboardingProfile();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkExperienceFormValues>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues: { experiences: [DEFAULT_WORK_EXPERIENCE] },
  });

  const [pendingRemoval, setPendingRemoval] = useState<number | null>(null);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experiences",
  });

  // Watched so each row's Ended picker disappears while "currently work here" is on.
  const watchedExperiences = useWatch({ control, name: "experiences" });

  useEffect(() => {
    if (!profile) return;

    reset({
      experiences: profile.work_experiences.length
        ? profile.work_experiences.map((entry) => ({
            employer: entry.employer,
            job_title: entry.job_title,
            started_at: entry.started_at.slice(0, 10),
            ended_at: entry.ended_at?.slice(0, 10) ?? "",
            is_current: entry.is_current,
          }))
        : [DEFAULT_WORK_EXPERIENCE],
    });
  }, [profile, reset]);

  const { save, isPending } = useSaveOnboardingStep<WorkExperienceFormValues>({
    url: API_ENDPOINTS.driverOnboarding.workExperience,
    redirectTo: "/driver/onboarding/guarantors",
    onSuccessMessage: "Work experience saved",
  });

  // Only a row that already exists on the server is worth stopping for - a
  // freshly added one has nothing to lose.
  const savedCount = profile?.work_experiences.length ?? 0;

  const removeRow = (index: number) => {
    if (index < savedCount) return setPendingRemoval(index);
    remove(index);
  };

  return (
    <OnboardingShell
      step="WORK_EXPERIENCE"
      tips={ONBOARDING_TIPS.WORK_EXPERIENCE}
      footer={{ label: "Continue", formId: "step-form", isLoading: isPending, hint: "Saved when you continue" }}
    >
      <StepHeader step="WORK_EXPERIENCE" title="Where have you driven before?" description="Add your previous driving jobs so clients can see your track record. Even a short role counts." />

      {/* An empty or current-role end date must be omitted - the server
          coerces "" into Invalid Date and rejects the whole step. */}
      <form
        id="step-form"
        onSubmit={handleSubmit((data) =>
          save({
            experiences: data.experiences.map((entry) => ({
              ...entry,
              ended_at:
                entry.is_current || !entry.ended_at
                  ? undefined
                  : entry.ended_at,
            })),
          }),
        )}
        className="space-y-3.5"
      >
        {fields.map((field, index) => (
          <StepPanel
            key={field.id}
            title={watchedExperiences?.[index]?.employer || `Role ${index + 1}`}
            description={watchedExperiences?.[index]?.job_title || "Employer and job title"}
            icon={Briefcase}
          >
          <div className="space-y-4">
            <FormInput<WorkExperienceFormValues>
              control={control}
              name={`experiences.${index}.employer`}
              errors={errors}
              label="Employer"
              placeholder="E.g Meridian Logistics"
            />

            <FormInput<WorkExperienceFormValues>
              control={control}
              name={`experiences.${index}.job_title`}
              errors={errors}
              label="Job title"
              placeholder="E.g Corporate Driver"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormDatePicker<WorkExperienceFormValues>
                control={control}
                mode="single"
                name={`experiences.${index}.started_at`}
                errors={errors}
                label="Started"
                captionLayout="dropdown"
                maxDate={new Date()}
              />

              {!watchedExperiences?.[index]?.is_current && (
                <FormDatePicker<WorkExperienceFormValues>
                  control={control}
                  mode="single"
                  name={`experiences.${index}.ended_at`}
                  errors={errors}
                  label="Ended"
                  captionLayout="dropdown"
                  maxDate={new Date()}
                />
              )}
            </div>

            <FormInput<WorkExperienceFormValues>
              control={control}
              name={`experiences.${index}.is_current`}
              errors={errors}
              type="checkbox"
              label="I currently work here"
            />

            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => removeRow(index)}
                disabled={fields.length === 1}
                className="text-destructive border-destructive/40 h-10 rounded-lg px-4"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>

              {index === fields.length - 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => append(DEFAULT_WORK_EXPERIENCE)}
                  className="text-brand h-10 rounded-lg px-4"
                >
                  <Plus className="h-4 w-4" />
                  Add another role
                </Button>
              )}
            </div>
          </div>
          </StepPanel>
        ))}
      </form>

      <ConfirmDialog
        isOpen={pendingRemoval !== null}
        onOpenChange={(open) => !open && setPendingRemoval(null)}
        icon={Trash2}
        iconClassName="text-destructive"
        title="Remove this role?"
        description="It is removed from your application when you save this step."
        confirmLabel="Remove"
        confirmVariant="destructive"
        onConfirm={() => {
          if (pendingRemoval !== null) remove(pendingRemoval);
          setPendingRemoval(null);
        }}
      />
    </OnboardingShell>
  );
}
