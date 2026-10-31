"use client";

import { AppSheet } from "@/components/shared/app-sheet";
import { Button } from "@/components/ui/button";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate, formatMoney } from "@/lib/utils";
import type { ReferrerDetail } from "@/types/referral";
import type { APIResponse } from "@/types/response";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ReferralStatusChip } from "./referral-status-chip";

interface Props {
  userId: string | null;
  onOpenChange: (open: boolean) => void;
  onReview: (referralId: string) => void;
  onSelectDriver: (userId: string) => void;
}

export const ReferrerSheet = function ({ userId, onOpenChange, onReview, onSelectDriver }: Props) {
  const { data } = useGetData<APIResponse<ReferrerDetail>>({
    url: API_ENDPOINTS.adminReferrals.referrer(userId ?? ""),
    shouldFetch: !!userId,
  });

  const detail = data?.data?.id === userId ? data?.data : undefined;

  return (
    <AppSheet
      isOpen={!!userId}
      onOpenChange={onOpenChange}
      title={detail?.name ?? "Driver"}
      description={detail ? [detail.location, `Joined ${formatDate(detail.joined_at)}`].filter(Boolean).join(" · ") : undefined}
      width="440px"
    >
      {!detail ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-muted/60 rounded-xl p-3">
              <span className="text-muted-foreground block text-xs">Referrals</span>
              <strong className="text-base">{detail.total}</strong>
            </div>
            <div className="bg-muted/60 rounded-xl p-3">
              <span className="text-muted-foreground block text-xs">Rewards earned</span>
              <strong className="text-base">{formatMoney(detail.earned_minor, "NGN")}</strong>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[12.5px] font-semibold">Referral chain</p>
            <div className="flex flex-wrap items-center gap-1.5 text-[12.5px]">
              {detail.chain.length ? (
                detail.chain.map((link) => (
                  <span key={link.id} className="flex items-center gap-1.5">
                    <button type="button" onClick={() => onSelectDriver(link.id)} className="border-border hover:border-brand rounded-full border bg-white px-2.5 py-0.5">
                      {link.name}
                    </button>
                    <ChevronRight className="text-muted-foreground size-3.5" />
                  </span>
                ))
              ) : (
                <>
                  <span className="border-border rounded-full border bg-white px-2.5 py-0.5">Joined directly</span>
                  <ChevronRight className="text-muted-foreground size-3.5" />
                </>
              )}
              <span className="bg-brand-soft text-brand rounded-full px-2.5 py-0.5 font-semibold">{detail.name}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[12.5px] font-semibold">Referral code</p>
            <p className="bg-muted/60 rounded-lg px-3 py-2 font-semibold tracking-[0.08em]">{detail.code ?? "Not generated yet"}</p>
          </div>

          <div className="space-y-1.5">
            <p className="text-[12.5px] font-semibold">Drivers they referred</p>
            <div className="border-border divide-border divide-y overflow-hidden rounded-xl border">
              {detail.referrals.length ? (
                detail.referrals.map((referral) => (
                  <button
                    type="button"
                    key={referral.id}
                    onClick={() => onReview(referral.id)}
                    className="hover:bg-muted/50 flex w-full items-center gap-3 px-3 py-2.5 text-left"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">{referral.name}</span>
                      <span className="text-muted-foreground block text-xs">Joined {formatDate(referral.joined_at)}</span>
                    </span>
                    <ReferralStatusChip status={referral.status} />
                  </button>
                ))
              ) : (
                <p className="text-muted-foreground px-3 py-3 text-sm">No referrals yet.</p>
              )}
            </div>
          </div>

          <Button asChild variant="outline" className="h-10 w-full rounded-lg">
            <Link href={`/admin/dashboard/drivers/${detail.id}`}>Open driver profile</Link>
          </Button>
        </div>
      )}
    </AppSheet>
  );
};
