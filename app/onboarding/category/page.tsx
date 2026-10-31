"use client";

import { Building2, CalendarDays, Globe, House, ShieldCheck, Star, type LucideIcon } from "lucide-react";

import { useEffect, useState } from "react";
import { CLIENT_DRIVER_CATEGORY_OPTIONS } from "@/lib/utils";
import type { ClientDriverCategory } from "@/types/auth";
import { OnboardingShell } from "../_components/onboarding-shell";
import { OptionCard } from "../_components/option-card";
import { usePreferences } from "../_hooks/use-preferences";
import { useSavePreferences } from "../_hooks/use-save-preferences";

const CATEGORY_ICONS: Record<ClientDriverCategory, LucideIcon> = {
  CONTRACT: CalendarDays,
  PRIVATE: House,
  CORPORATE: Building2,
  EXECUTIVE: Star,
  SPY: ShieldCheck,
  EXPATRIATE: Globe,
};

export default function Category() {
  const { preferences } = usePreferences();

  const [selected, setSelected] = useState<ClientDriverCategory[]>([]);

  useEffect(() => {
    if (preferences) setSelected(preferences.hiring_categories);
  }, [preferences]);

  const { save, isPending } = useSavePreferences({
    redirectTo: "/onboarding/capacity",
  });

  const toggle = (value: ClientDriverCategory) =>
    setSelected((current) =>
      current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value],
    );

  return (
    <OnboardingShell
      step={2}
      title="What kind of driver do you need?"
      subtitle="Pick all that apply - matching drivers show up first."
      isPending={isPending}
      continueDisabled={selected.length === 0}
      onContinue={() => save({ hiring_categories: selected })}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CLIENT_DRIVER_CATEGORY_OPTIONS.map((category) => (
          <OptionCard
            key={category.value}
            label={category.label}
            blurb={category.blurb}
            icon={CATEGORY_ICONS[category.value]}
            selected={selected.includes(category.value)}
            onSelect={() => toggle(category.value)}
          />
        ))}
      </div>
    </OnboardingShell>
  );
}
