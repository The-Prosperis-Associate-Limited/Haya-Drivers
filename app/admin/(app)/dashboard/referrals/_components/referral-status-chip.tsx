import { cn } from "@/lib/utils";
import type { ReferralStatus } from "@/types/referral";

const STATUS: Record<ReferralStatus, { label: string; tone: string }> = {
  SIGNED_UP: { label: "Onboarding", tone: "bg-amber-50 text-amber-700" },
  REWARDED: { label: "Rewarded", tone: "bg-emerald-50 text-emerald-700" },
  HELD: { label: "Held for review", tone: "bg-violet-50 text-violet-700" },
  REJECTED: { label: "Refused", tone: "bg-muted text-muted-foreground" },
  REVERSED: { label: "Reversed", tone: "bg-red-50 text-red-600" },
};

export const ReferralStatusChip = function ({ status }: { status: ReferralStatus }) {
  const chip = STATUS[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold whitespace-nowrap", chip.tone)}>
      <i className="size-1.5 rounded-full bg-current" />
      {chip.label}
    </span>
  );
};
