"use client";

import {
  DriverPublicProfile,
  HireDriverButton,
  ProfileCard,
  driverNameOf,
} from "@/components/drivers/driver-public-profile";
import { HireRequestDialog } from "@/components/hires/hire-request-dialog";
import { AppDialog } from "@/components/shared/app-dialog";
import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { driverTypeLabel, getInitials } from "@/lib/utils";
import { BadgeCheck, UserRound } from "lucide-react";
import { useState } from "react";
import type {
  DriverReview,
  DriverSearchResult,
  PublicDriverProfile,
} from "@/types/driver";
import type { APIResponse, PaginatedResponse } from "@/types/response";
import { TrustRing } from "./trust-ring";

interface Props {
  driverUserId: string | null;
  onOpenChange: (open: boolean) => void;
}

export const DriverProfileDialog = function ({
  driverUserId,
  onOpenChange,
}: Props) {
  const [hireOpen, setHireOpen] = useState(false);

  const { data, isFetching } = useGetData<APIResponse<PublicDriverProfile>>({
    url: driverUserId ? API_ENDPOINTS.drivers.detail(driverUserId) : "",
    shouldFetch: !!driverUserId,
  });

  const { data: reviewsData } = useGetData<PaginatedResponse<DriverReview>>({
    url: driverUserId ? API_ENDPOINTS.drivers.reviews(driverUserId) : "",
    shouldFetch: !!driverUserId,
  });

  const profile = data?.data;

  // Same type, same state - the two most alike drivers the marketplace has.
  const { data: similarData } = useGetData<
    PaginatedResponse<DriverSearchResult>
  >({
    url: profile
      ? API_ENDPOINTS.drivers.search(
          new URLSearchParams({
            ...(profile.driver_type && { driver_type: profile.driver_type }),
            ...(profile.user.state_of_residence && {
              state: profile.user.state_of_residence,
            }),
            limit: "3",
          }).toString(),
        )
      : "",
    shouldFetch: !!profile,
  });

  const similar = (similarData?.data ?? [])
    .filter((driver) => driver.userId !== driverUserId)
    .slice(0, 2);

  return (
    <AppDialog
      isOpen={!!driverUserId}
      onOpenChange={onOpenChange}
      title="Driver profile"
      width="1100px"
    >
      {isFetching && !profile ? (
        <div className="space-y-4">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : !profile ? (
        <EmptyState
          icon={UserRound}
          title="Driver not found"
          description="This profile is no longer available."
        />
      ) : (
        <DriverPublicProfile
          profile={profile}
          reviews={reviewsData?.data ?? []}
          action={
            <HireDriverButton
              profile={profile}
              onClick={() => setHireOpen(true)}
            />
          }
          aside={
            similar.length > 0 && (
              <ProfileCard title="Similar drivers">
                <div className="divide-border mt-3 divide-y">
                  {similar.map((driver) => (
                    <div
                      key={driver.id}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative shrink-0">
                          <Avatar className="size-10">
                            <AvatarImage
                              src={driver.user.profile_pic ?? undefined}
                              alt=""
                            />
                            <AvatarFallback>
                              {getInitials(
                                driver.user.first_name,
                                driver.user.last_name,
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <BadgeCheck className="fill-brand absolute -right-0.5 -bottom-0.5 size-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <AppText type="label" className="block truncate">
                            {[driver.user.first_name, driver.user.last_name]
                              .filter(Boolean)
                              .join(" ") || "Driver"}
                          </AppText>
                          <AppText
                            type="caption"
                            className="text-muted-foreground block truncate"
                          >
                            {driverTypeLabel(driver.driver_type)}
                          </AppText>
                        </div>
                      </div>
                      <TrustRing
                        score={driver.trust_score}
                        size={44}
                        label={null}
                      />
                    </div>
                  ))}
                </div>
              </ProfileCard>
            )
          }
        />
      )}

      {profile && driverUserId && (
        <HireRequestDialog
          isOpen={hireOpen}
          onOpenChange={setHireOpen}
          driverUserId={driverUserId}
          driverName={driverNameOf(profile)}
          rateMinor={profile.expected_monthly_rate}
          rateCurrency={profile.rate_currency}
        />
      )}
    </AppDialog>
  );
};
