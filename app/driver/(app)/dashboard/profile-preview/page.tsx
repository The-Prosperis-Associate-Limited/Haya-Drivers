"use client";

import { DriverPublicProfile } from "@/components/drivers/driver-public-profile";
import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { useGetProfile } from "@/hooks/use-get-profile";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { Eye, Info, PencilLine } from "lucide-react";
import Link from "next/link";
import type { APIResponse } from "@/types/response";
import type { PublicDriverProfile } from "@/types/driver";
import { useReviews } from "../reviews/_hooks/use-reviews";

export default function ProfilePreview() {
  const { profile: account } = useGetProfile();
  const isVerified =
    account?.driver_profile?.verification_status === "APPROVED";

  const { data, isFetching } = useGetData<APIResponse<PublicDriverProfile>>({
    url: API_ENDPOINTS.driverProfile.preview,
  });
  const { reviews } = useReviews({ page: 1, limit: 4 });

  const profile = data?.data;

  return (
    <div className="mx-auto max-w-[1360px] space-y-5">
      <div
        className={
          isVerified
            ? "border-brand/20 bg-brand-soft/60 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center"
            : "flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center"
        }
      >
        <span
          className={
            isVerified
              ? "bg-brand grid size-10 shrink-0 place-items-center rounded-xl text-white"
              : "grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500 text-white"
          }
        >
          {isVerified ? (
            <Eye className="size-5" />
          ) : (
            <Info className="size-5" />
          )}
        </span>
        <div className="flex-1">
          <AppText type="label" className="block text-sm font-semibold">
            {isVerified
              ? "This is exactly what clients see"
              : "Clients can't see your profile yet"}
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            {isVerified
              ? "Your bio, rate, work history and reviews come from Settings and your past jobs. Your contact details are never shown here."
              : "It goes live in search once your verification is approved. This preview shows how it will look."}
          </AppText>
        </div>
        <Button
          asChild
          variant="outline"
          className="h-10 rounded-xl bg-white px-4"
        >
          <Link href="/driver/dashboard/settings">
            <PencilLine className="size-4" />
            Edit profile
          </Link>
        </Button>
      </div>

      {!profile ? (
        isFetching ? (
          <div className="space-y-4">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        ) : null
      ) : (
        <DriverPublicProfile profile={profile} reviews={reviews} />
      )}
    </div>
  );
}
