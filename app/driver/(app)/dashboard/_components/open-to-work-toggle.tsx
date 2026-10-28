"use client";

import { Switch } from "@/components/ui/switch";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useState } from "react";

interface Props {
  value: boolean;
}

export const OpenToWorkToggle = function ({ value }: Props) {
  const [checked, setChecked] = useState(value);

  const { mutate, isPending } = useSubmitData<{ open_to_work: boolean }>({
    url: API_ENDPOINTS.driverProfile.openToWork,
    method: "patch",
    onSuccessMessage: "Availability updated",
    additionalQueryKeys: [[API_ENDPOINTS.auth.getProfile]],
    onError: () => setChecked((current) => !current),
  });

  const toggle = (next: boolean) => {
    setChecked(next);
    mutate({ open_to_work: next });
  };

  return (
    <label className="text-ink inline-flex h-10 cursor-pointer items-center gap-2.5 rounded-full bg-white pr-4 pl-1.5 text-[13px] font-semibold">
      <Switch
        checked={checked}
        onCheckedChange={toggle}
        disabled={isPending}
        className="data-[state=checked]:bg-emerald-500"
      />
      {checked ? "Available for work" : "Not taking new jobs"}
    </label>
  );
};
