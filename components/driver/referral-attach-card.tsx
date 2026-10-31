"use client";

import { BadgeCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGetData } from "@/hooks/use-get-data";
import {
  type ReferralCodeState,
  normaliseReferralCode,
} from "@/hooks/use-referral-code-preview";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  clearStashedReferralCode,
  readStashedReferralCode,
} from "@/lib/referral-stash";
import type { ReferralOverview } from "@/types/referral";
import type { APIResponse } from "@/types/response";
import { ReferralCodeField } from "./referral-code-field";

export const ReferralAttachCard = function () {
  const { data } = useGetData<APIResponse<ReferralOverview>>({
    url: API_ENDPOINTS.driverReferrals.overview,
  });

  const [code, setCode] = useState(readStashedReferralCode);
  const [state, setState] = useState<ReferralCodeState>("empty");

  const { mutate, isPending } = useSubmitData<{ code: string }, APIResponse<null>>({
    url: API_ENDPOINTS.driverReferrals.attach,
    method: "post",
    onSuccessMessage: "Referral code added",
    onSuccess: () => clearStashedReferralCode(),
  });

  if (!data) return null;

  const referredBy = data.data.referred_by;

  if (referredBy) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <BadgeCheck className="size-4 shrink-0" />
        <span>
          You were referred by <b>{referredBy.name}</b>. They&apos;ll be
          rewarded when you submit.
        </span>
      </div>
    );
  }

  return (
    <div className="border-border space-y-3 rounded-xl border border-dashed bg-white p-4">
      <ReferralCodeField
        value={code}
        onChange={setCode}
        label="Were you referred by a driver?"
        hint="Add their code before you submit - it can't be added afterwards."
        onStateChange={setState}
      />
      {state === "valid" && (
        <Button
          type="button"
          variant="outline"
          isLoading={isPending}
          onClick={() => mutate({ code: normaliseReferralCode(code) })}
          className="h-10 rounded-lg text-sm"
        >
          Apply referral code
        </Button>
      )}
    </div>
  );
};
