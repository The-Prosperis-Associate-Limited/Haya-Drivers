"use client";

import { PageHeader } from "@/components/shared/page-header";
import { useGetProfile } from "@/hooks/use-get-profile";
import { UnverifiedNotice } from "../job-request/_components/unverified-notice";
import { EarningsSettings } from "./_components/earnings-settings";

export default function Earnings() {
  const { profile } = useGetProfile();
  const status = profile?.driver_profile?.verification_status;

  return (
    <div className="mx-auto max-w-[1360px] space-y-5 lg:space-y-6">
      <PageHeader
        title="Earnings"
        subtitle="What Haya Drivers has paid you, what is on hold, and where your withdrawals go."
      />
      {profile &&
        (status === "APPROVED" ? (
          <EarningsSettings />
        ) : (
          <UnverifiedNotice status={status ?? "UNSUBMITTED"} />
        ))}
    </div>
  );
}
