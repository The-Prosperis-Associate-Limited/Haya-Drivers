"use client";

import { useEffect, useState } from "react";
import { AppInput } from "@/components/shared/app-input";
import { Building2, House, UserRound } from "lucide-react";
import type { ClientType } from "@/types/auth";
import { OnboardingShell } from "../_components/onboarding-shell";
import { OptionCard } from "../_components/option-card";
import { usePreferences } from "../_hooks/use-preferences";
import { useSavePreferences } from "../_hooks/use-save-preferences";

const HIRE_TYPES = [
  { value: "INDIVIDUAL" as ClientType, label: "Myself or my family", blurb: "School runs, errands, a personal driver for you", icon: House },
  { value: "ORGANISATION" as ClientType, label: "A company", blurb: "Staff, executives or logistics - invoiced to your organisation", icon: Building2 },
];

export default function HireType() {
  const { preferences } = usePreferences();

  const [clientType, setClientType] = useState<ClientType>("INDIVIDUAL");
  const [organisationName, setOrganisationName] = useState("");

  useEffect(() => {
    if (!preferences) return;
    setClientType(preferences.client_type);
    setOrganisationName(preferences.organisation_name ?? "");
  }, [preferences]);

  const { save, isPending } = useSavePreferences({
    redirectTo: "/onboarding/category",
  });

  const isOrganisation = clientType === "ORGANISATION";

  return (
    <OnboardingShell
      step={1}
      title="Who are you hiring for?"
      subtitle="This decides how invoices are addressed and which drivers we suggest."
      isPending={isPending}
      continueDisabled={isOrganisation && organisationName.trim().length < 2}
      onContinue={() =>
        save({
          client_type: clientType,
          ...(isOrganisation && { organisation_name: organisationName.trim() }),
        })
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {HIRE_TYPES.map((type) => (
          <OptionCard
            key={type.value}
            label={type.label}
            blurb={type.blurb}
            icon={type.icon}
            selected={clientType === type.value}
            onSelect={() => setClientType(type.value)}
          />
        ))}
      </div>

      {isOrganisation && (
        <div className="mt-6">
          <AppInput
            label="Company name"
            placeholder="E.g Acme Logistics"
            icon={UserRound}
            value={organisationName}
            onChange={(event) => setOrganisationName(event.target.value)}
          />
        </div>
      )}
    </OnboardingShell>
  );
}
