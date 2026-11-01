"use client";

import { AppInput } from "@/components/shared/app-input";
import { AppSelect } from "@/components/shared/app-select";
import { Button } from "@/components/ui/button";
import { lgaOptionsForState } from "@/lib/nigeria-lgas";
import { cn, DRIVER_TYPE_OPTIONS } from "@/lib/utils";
import { State } from "country-state-city";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export interface SearchFilters {
  driver_type?: string;
  state?: string;
  city?: string;
  budget?: string;
}

interface Props {
  defaults?: SearchFilters;
  buttonLabel?: string;
  className?: string;
  onSearch?: (filters: SearchFilters) => void;
}

// The marketplace is Nigeria-only for now - "Verified hiring for Nigeria".
const NIGERIA = "NG";

export const SearchPanel = function ({
  defaults,
  buttonLabel = "Search",
  className,
  onSearch,
}: Props) {
  const router = useRouter();

  const [driverType, setDriverType] = useState(defaults?.driver_type ?? "");
  const [state, setState] = useState(defaults?.state ?? "");
  const [city, setCity] = useState(defaults?.city ?? "");
  const [budget, setBudget] = useState(defaults?.budget ?? "");

  const states = useMemo(
    () =>
      State.getStatesOfCountry(NIGERIA).map((entry) => ({
        value: entry.name,
        label: `${entry.name}, Nigeria`,
      })),
    [],
  );

  const cities = useMemo(() => lgaOptionsForState(state), [state]);

  const submit = () => {
    const filters: SearchFilters = {
      ...(driverType && { driver_type: driverType }),
      ...(state && { state }),
      ...(city && { city }),
      ...(budget && { budget }),
    };

    if (onSearch) return onSearch(filters);

    const params = new URLSearchParams(filters as Record<string, string>);

    router.push(`/marketplace/search?${params.toString()}`);
  };

  return (
    <div
      className={cn(
        "grid grid-cols-1 items-end gap-4 rounded-2xl bg-white p-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]",
        className,
      )}
    >
      <AppSelect
        label="Category"
        placeholder="Any category"
        options={DRIVER_TYPE_OPTIONS}
        value={driverType || null}
        onValueChange={(value) => setDriverType(value ?? "")}
      />

      <AppSelect
        label="State, Country"
        placeholder="Anywhere in Nigeria"
        options={states}
        value={state || null}
        onValueChange={(value) => {
          setState(value ?? "");
          setCity("");
        }}
      />

      <AppSelect
        label="Local Government"
        placeholder={state ? "Any area" : "Pick a state first"}
        options={cities}
        value={city || null}
        onValueChange={(value) => setCity(value ?? "")}
        disabled={!state}
      />

      <AppInput
        label="Salary Budget (₦)"
        placeholder="E.g 250000"
        inputMode="numeric"
        suffix="/ month"
        className="h-11"
        value={budget}
        onChange={(event) => setBudget(event.target.value.replace(/\D/g, ""))}
      />

      <Button onClick={submit} className="h-12 rounded-xl px-8 text-sm">
        {buttonLabel}
      </Button>
    </div>
  );
};
