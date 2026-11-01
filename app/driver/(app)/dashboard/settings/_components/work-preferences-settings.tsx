"use client";

import { FormInput } from "@/components/form/form-input";
import { SettingsCard } from "@/components/settings/settings-card";
import { AppText } from "@/components/shared/app-text";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useGetProfile } from "@/hooks/use-get-profile";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { toMajorUnits, toMinorUnits } from "@/lib/utils";
import {
  workPreferencesSchema,
  type WorkPreferencesFormValues,
} from "@/schemas/settings/work-preferences";
import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseBusiness, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

export const WorkPreferencesSettings = function () {
  const { profile } = useGetProfile();
  const [rowToRemove, setRowToRemove] = useState<number | null>(null);
  const savedCount = profile?.driver_profile?.availability?.length ?? 0;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkPreferencesFormValues>({
    resolver: zodResolver(workPreferencesSchema),
    defaultValues: { expected_monthly_rate: "", availability: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "availability",
  });

  useEffect(() => {
    const driverProfile = profile?.driver_profile;
    if (!driverProfile) return;

    const availability = driverProfile.availability ?? [];

    reset({
      expected_monthly_rate: driverProfile.expected_monthly_rate
        ? String(toMajorUnits(driverProfile.expected_monthly_rate))
        : "",
      availability,
    });
  }, [profile, reset]);

  const { mutate: savePreferences, isPending } = useSubmitData({
    url: API_ENDPOINTS.driverProfile.workPreferences,
    method: "put",
    onSuccessMessage: "Work preferences saved",
  });

  const save = (data: WorkPreferencesFormValues) =>
    savePreferences({
      expected_monthly_rate: data.expected_monthly_rate
        ? toMinorUnits(Number(data.expected_monthly_rate))
        : null,
      availability: data.availability.length ? data.availability : null,
    });

  const requestRemove = (index: number) => {
    if (index < savedCount) return setRowToRemove(index);
    remove(index);
  };

  return (
    <form onSubmit={handleSubmit(save)} className="mt-4">
      <SettingsCard
        title="Work preferences"
        description="What you expect to earn and when you work - clients filter and view these on your marketplace profile."
        icon={BriefcaseBusiness}
        footer={
          <Button isLoading={isPending} className="h-10 rounded-xl px-5">
            Save preferences
          </Button>
        }
      >
        <div className="max-w-sm">
          <FormInput<WorkPreferencesFormValues>
            control={control}
            name="expected_monthly_rate"
            errors={errors}
            label="Expected monthly rate (₦)"
            placeholder="E.g 250000"
            inputMode="numeric"
            suffix="/ month"
          />
        </div>

        <div className="mt-6">
          <AppText type="label" className="block">
            Working hours
          </AppText>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="mt-3 grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <FormInput<WorkPreferencesFormValues>
                control={control}
                name={`availability.${index}.day_range`}
                errors={errors}
                label="Days"
                placeholder="E.g Mon - Fri"
              />
              <FormInput<WorkPreferencesFormValues>
                control={control}
                name={`availability.${index}.start`}
                errors={errors}
                label="From"
                placeholder="E.g 8:00 AM"
              />
              <FormInput<WorkPreferencesFormValues>
                control={control}
                name={`availability.${index}.end`}
                errors={errors}
                label="To"
                placeholder="E.g 6:00 PM"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove hours"
                onClick={() => requestRemove(index)}
                className="text-muted-foreground hover:text-destructive mb-1"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {fields.length < 7 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ day_range: "", start: "", end: "" })}
              className="mt-3 h-10 rounded-xl text-sm"
            >
              <Plus className="h-4 w-4" />
              Add hours
            </Button>
          )}
        </div>
      </SettingsCard>

      <ConfirmDialog
        isOpen={rowToRemove !== null}
        onOpenChange={(open) => !open && setRowToRemove(null)}
        icon={Trash2}
        iconClassName="text-destructive"
        title="Remove these working hours?"
        description="Clients will no longer see this slot on your profile once you save."
        confirmLabel="Remove"
        confirmVariant="destructive"
        onConfirm={() => {
          if (rowToRemove !== null) remove(rowToRemove);
          setRowToRemove(null);
        }}
      />
    </form>
  );
};
