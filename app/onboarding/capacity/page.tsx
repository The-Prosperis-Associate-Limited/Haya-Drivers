"use client";

import { useEffect, useState } from "react";
import { ASSIGNMENT_TYPE_OPTIONS, DRIVERS_NEEDED_OPTIONS } from "@/lib/utils";
import type { AssignmentType, DriversNeededRange } from "@/types/auth";
import { OnboardingShell } from "../_components/onboarding-shell";
import { OptionCard } from "../_components/option-card";
import { usePreferences } from "../_hooks/use-preferences";
import { useSavePreferences } from "../_hooks/use-save-preferences";

export default function Capacity() {
  const { preferences } = usePreferences();

  const [driversNeeded, setDriversNeeded] = useState<DriversNeededRange | null>(
    null,
  );
  const [assignmentType, setAssignmentType] = useState<AssignmentType | null>(
    null,
  );

  useEffect(() => {
    if (!preferences) return;
    setDriversNeeded(preferences.drivers_needed);
    setAssignmentType(preferences.assignment_type);
  }, [preferences]);

  const { save, isPending } = useSavePreferences({
    redirectTo: "/onboarding/location",
  });

  return (
    <OnboardingShell
      step={3}
      title="How many drivers, and for how long?"
      subtitle="A rough number is fine."
      isPending={isPending}
      continueDisabled={!driversNeeded || !assignmentType}
      onContinue={() =>
        save({
          drivers_needed: driversNeeded,
          assignment_type: assignmentType,
        })
      }
    >
      <p className="mb-2.5 text-[13px] font-semibold text-slate-700">Drivers needed</p>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {DRIVERS_NEEDED_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            selected={driversNeeded === option.value}
            onSelect={() => setDriversNeeded(option.value)}
          />
        ))}
      </div>

      <p className="mt-7 mb-2.5 text-[13px] font-semibold text-slate-700">For how long?</p>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {ASSIGNMENT_TYPE_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            selected={assignmentType === option.value}
            onSelect={() => setAssignmentType(option.value)}
          />
        ))}
      </div>
    </OnboardingShell>
  );
}
