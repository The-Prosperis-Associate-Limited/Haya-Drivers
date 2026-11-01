"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { VERIFICATION_COPY } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { DriverVerificationStatus } from "@/types/driver";

interface Props {
  status: DriverVerificationStatus;
}

// The job-request routes 403 an unverified driver, so screens show this instead of fetching.
export const UnverifiedNotice = function ({ status }: Props) {
  return (
    <div className="border-border rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <EmptyState
        icon={ShieldCheck}
        title="Clients can't reach you yet"
        description={VERIFICATION_COPY[status].headline}
        action={
          status === "PENDING" ? undefined : (
            <Button asChild className="h-10 rounded-xl px-5">
              <Link
                href={
                  status === "REJECTED"
                    ? "/driver/dashboard/settings?tab=verification"
                    : "/driver/onboarding"
                }
              >
                {status === "REJECTED"
                  ? "Fix your documents"
                  : "Finish your profile"}
              </Link>
            </Button>
          )
        }
      />
    </div>
  );
};
