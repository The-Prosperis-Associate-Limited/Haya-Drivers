"use client";

import {
  DriverPublicProfile,
  driverNameOf,
} from "@/components/drivers/driver-public-profile";
import { HireRequestDialog } from "@/components/hires/hire-request-dialog";
import { BackLink } from "@/components/shared/back-link";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { Plus, UserRound } from "lucide-react";
import { use, useState } from "react";
import type { DriverReview, PublicDriverProfile } from "@/types/driver";
import type { APIResponse, PaginatedResponse } from "@/types/response";

export default function DriverProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [hireOpen, setHireOpen] = useState(false);

  const { data, isFetching } = useGetData<APIResponse<PublicDriverProfile>>({
    url: API_ENDPOINTS.drivers.detail(id),
  });

  const { data: reviewsData } = useGetData<PaginatedResponse<DriverReview>>({
    url: API_ENDPOINTS.drivers.reviews(id),
  });

  const profile = data?.data;

  return (
    <div className="mx-auto max-w-[1360px] space-y-5">
      <BackLink href="/dashboard/requests/find-talent" label="Find drivers" />

      {!profile ? (
        isFetching ? (
          <div className="space-y-4">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        ) : (
          <EmptyState
            icon={UserRound}
            title="Driver not found"
            description="This profile is no longer available."
          />
        )
      ) : (
        <>
          <DriverPublicProfile
            profile={profile}
            reviews={reviewsData?.data ?? []}
            action={
              // The paid hire flow: request → admin invoice → pay → contact details.
              <Button
                className="h-11 w-full rounded-xl px-6 text-sm sm:w-auto"
                onClick={() => setHireOpen(true)}
                disabled={profile.open_to_work === false}
              >
                <Plus className="h-4 w-4" />
                {profile.open_to_work === false
                  ? "Not taking new jobs"
                  : "Hire driver"}
              </Button>
            }
          />

          <HireRequestDialog
            isOpen={hireOpen}
            onOpenChange={setHireOpen}
            driverUserId={id}
            driverName={driverNameOf(profile)}
            rateMinor={profile.expected_monthly_rate}
            rateCurrency={profile.rate_currency}
          />
        </>
      )}
    </div>
  );
}
