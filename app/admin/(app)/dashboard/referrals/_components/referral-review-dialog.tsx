"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { AppTextArea } from "@/components/shared/app-textarea";
import { Button } from "@/components/ui/button";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { showToast } from "@/lib/show-toast";
import { cn, formatDateTime } from "@/lib/utils";
import type { AdminReferral } from "@/types/referral";
import type { APIResponse } from "@/types/response";
import { ArrowRight, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { ReferralStatusChip } from "./referral-status-chip";

interface Props {
  referralId: string | null;
  onOpenChange: (open: boolean) => void;
}

export const ReferralReviewDialog = function ({ referralId, onOpenChange }: Props) {
  const [note, setNote] = useState("");

  const { data } = useGetData<APIResponse<AdminReferral>>({
    url: API_ENDPOINTS.adminReferrals.detail(referralId ?? ""),
    shouldFetch: !!referralId,
  });

  const close = () => {
    setNote("");
    onOpenChange(false);
  };

  const approve = useSubmitData<{ note?: string }, APIResponse<AdminReferral>>({
    url: API_ENDPOINTS.adminReferrals.approve(referralId ?? ""),
    onSuccessMessage: "Reward approved and paid",
    onSuccess: close,
  });
  const reject = useSubmitData<{ reason: string }, APIResponse<AdminReferral>>({
    url: API_ENDPOINTS.adminReferrals.reject(referralId ?? ""),
    onSuccessMessage: "Reward rejected",
    onSuccess: close,
  });
  const reverse = useSubmitData<{ reason: string }, APIResponse<AdminReferral>>({
    url: API_ENDPOINTS.adminReferrals.reverse(referralId ?? ""),
    onSuccessMessage: "Reward reversed",
    onSuccess: close,
  });

  const referral = data?.data;
  const needsReason = (action: { mutate: (body: { reason: string }) => void }) => {
    if (note.trim().length < 3) return showToast("error", "Write a short reason first");
    action.mutate({ reason: note.trim() });
  };

  const held = referral?.status === "HELD" || (referral?.status === "SIGNED_UP" && !!referral.qualified_at);
  const paid = referral?.status === "REWARDED";

  return (
    <AppDialog
      isOpen={!!referralId}
      onOpenChange={(open) => (open ? null : close())}
      title="Referral review"
      width="560px"
      isSubmitting={approve.isPending || reject.isPending || reverse.isPending}
      dialogFooter={
        referral &&
        (held ? (
          <>
            <Button variant="outline" onClick={() => needsReason(reject)} isLoading={reject.isPending} className="h-10 rounded-lg px-4 text-red-600">
              Reject reward
            </Button>
            <Button onClick={() => approve.mutate({ note: note.trim() || undefined })} isLoading={approve.isPending} className="h-10 rounded-lg px-4">
              Approve and pay reward
            </Button>
          </>
        ) : paid ? (
          <Button variant="outline" onClick={() => needsReason(reverse)} isLoading={reverse.isPending} className="h-10 rounded-lg px-4 text-red-600">
            Reverse reward
          </Button>
        ) : undefined)
      }
    >
      {!referral ? (
        <p className="text-muted-foreground py-6 text-sm">Loading…</p>
      ) : (
        <div className="space-y-4 py-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold">{referral.referrer.name}</span>
            <ArrowRight className="text-muted-foreground size-4" />
            <span className="font-semibold">{referral.referee.name}</span>
            <ReferralStatusChip status={referral.status} />
          </div>

          <dl className="border-border grid grid-cols-2 gap-x-4 gap-y-2 border-y border-dashed py-3 text-[13px]">
            {[
              ["Code", referral.code],
              ["Added at", referral.channel === "SIGNUP" ? "Sign-up" : "Onboarding"],
              ["Referee email", referral.referee.email],
              ["Referrer status", referral.referrer.verification_status ? referral.referrer.verification_status.charAt(0) + referral.referrer.verification_status.slice(1).toLowerCase() : "-"],
              ["Submitted", referral.qualified_at ? formatDateTime(referral.qualified_at) : "Not yet"],
              ["Risk score", `${referral.risk_score} / 100`],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-muted-foreground text-[11.5px]">{label}</dt>
                <dd className="truncate font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="space-y-2">
            <p className="text-[12.5px] font-semibold">Abuse checks</p>
            {referral.risk_flags.length ? (
              <ul className="space-y-1.5">
                {referral.risk_flags.map((flag) => (
                  <li
                    key={flag.key}
                    className={cn(
                      "flex items-start gap-2 rounded-lg px-3 py-2 text-[13px]",
                      flag.blocks ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800",
                    )}
                  >
                    <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                    {flag.label}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700">
                <ShieldCheck className="size-4" />
                {referral.qualified_at ? "Passed every check" : "Checks run when the referee submits"}
              </p>
            )}
            <p className="text-muted-foreground text-[11.5px]">
              Shared networks are common on mobile data and in offices - weigh a network match against the other signals.
            </p>
          </div>

          {referral.review_note && (
            <p className="bg-muted rounded-lg px-3 py-2 text-[13px]">
              <b>{referral.reviewed_by ?? "System"}:</b> {referral.review_note}
            </p>
          )}

          {(held || paid) && (
            <AppTextArea
              label={held ? "Note (required to reject)" : "Reason for reversing"}
              placeholder={held ? "e.g. Same household - checked with both drivers" : "e.g. Duplicate account confirmed"}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
            />
          )}
          {paid && (
            <p className="text-muted-foreground text-[11.5px]">
              Reversing voids the reward if it&apos;s still on hold, or debits it from the referrer&apos;s wallet if it was already released.
            </p>
          )}
        </div>
      )}
    </AppDialog>
  );
};
