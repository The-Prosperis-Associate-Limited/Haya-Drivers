"use client";

import { BadgeCheck, Gift, Loader2, Lock } from "lucide-react";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  type ReferralCodeState,
  useReferralCodePreview,
} from "@/hooks/use-referral-code-preview";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
  locked?: boolean;
  onUnlock?: () => void;
  label?: string;
  hint?: string;
  onStateChange?: (state: ReferralCodeState) => void;
}

export const ReferralCodeField = function ({
  value,
  onChange,
  locked,
  onUnlock,
  label = "Referral code",
  hint = "Got a code from a driver on Haya Drivers? Enter it here.",
  onStateChange,
}: Props) {
  const { state, preview } = useReferralCodePreview(value);

  useEffect(() => onStateChange?.(state), [state, onStateChange]);

  const Icon = locked ? Lock : Gift;

  return (
    <div className="space-y-2">
      <Label htmlFor="referral_code" className="text-sm font-medium">
        {label}{" "}
        {!locked && (
          <span className="text-muted-foreground font-normal">(optional)</span>
        )}
      </Label>

      <div
        className={cn(
          "border-border focus-within:border-brand focus-within:ring-brand/10 flex h-12 items-center gap-2 rounded-lg border bg-white px-3.5 transition-colors focus-within:ring-4",
          state === "valid" && "border-emerald-300 bg-emerald-50",
          state === "invalid" && "border-red-200 bg-red-50",
        )}
      >
        <Icon
          className={cn(
            "text-muted-foreground size-4 shrink-0",
            state === "valid" && "text-emerald-600",
            state === "invalid" && "text-red-500",
          )}
        />
        <input
          id="referral_code"
          value={value}
          readOnly={locked}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          placeholder="e.g. EMEKA-K7Q2"
          autoComplete="off"
          spellCheck={false}
          maxLength={16}
          className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm font-semibold tracking-[0.1em] uppercase outline-none placeholder:font-normal placeholder:tracking-normal placeholder:normal-case"
        />
        {state === "checking" && (
          <Loader2 className="text-muted-foreground size-4 animate-spin" />
        )}
        {state === "valid" && <BadgeCheck className="size-4 text-emerald-600" />}
      </div>

      {state === "valid" && preview && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <BadgeCheck className="size-3.5" />
          Referred by {preview.referrer_name}
        </p>
      )}
      {state === "invalid" && (
        <p className="text-xs font-medium text-red-600">
          We couldn&apos;t find that code. Check it with the driver who sent it,
          or leave it blank.
        </p>
      )}
      {(state === "empty" || state === "typing") && !locked && (
        <p className="text-muted-foreground text-xs">{hint}</p>
      )}
      {locked && onUnlock && (
        <button
          type="button"
          onClick={onUnlock}
          className="text-muted-foreground hover:text-foreground text-xs font-medium underline underline-offset-2"
        >
          Not your invite? Remove code
        </button>
      )}
    </div>
  );
};
