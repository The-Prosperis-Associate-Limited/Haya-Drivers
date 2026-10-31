"use client";

import { AppTabs } from "@/components/shared/app-tabs";
import { AppText } from "@/components/shared/app-text";
import { BackLink } from "@/components/shared/back-link";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { APIResponse } from "@/types/response";
import type { AdminUserDetail } from "@/types/admin";
import { DeleteAccountButton } from "../../../_components/delete-account-button";
import { UserWallet } from "../../../_components/user-wallet";
import { DriverDocuments } from "./_components/driver-documents";
import { DriverOverview } from "./_components/driver-overview";

type Tab = "overview" | "documents" | "wallet";

const TABS: { value: Tab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "documents", label: "KYC Documents" },
  { value: "wallet", label: "Wallet & Payments" },
];

function DriverDetail() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const requested = searchParams.get("tab");
  const tab =
    TABS.find((option) => option.value === requested)?.value ?? "overview";

  const { data, isFetching } = useGetData<APIResponse<AdminUserDetail>>({
    url: API_ENDPOINTS.adminUsers.detail(params.id),
  });

  const user = data?.data;

  return (
    <div className="mx-auto max-w-[1360px] space-y-6">
      <BackLink href="/admin/dashboard/drivers" label="Back to drivers" />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <AppText
            type="h2"
            className="text-[22px] font-semibold tracking-tight"
          >
            Know your Driver.
          </AppText>
          <AppText
            type="subtitle"
            className="text-muted-foreground text-[13px]"
          >
            Review the driver's profile, documents and wallet before making a
            decision.
          </AppText>
        </div>
        {user && (
          <DeleteAccountButton
            userId={params.id}
            name={
              [user.first_name, user.last_name].filter(Boolean).join(" ") ||
              "this driver"
            }
            backHref="/admin/dashboard/drivers"
            anonymisedAt={user.anonymised_at}
          />
        )}
      </div>

      <AppTabs<Tab>
        value={tab}
        onValueChange={(value) =>
          window.history.replaceState(null, "", `?tab=${value}`)
        }
        variant="outline"
        tabs={TABS}
      />

      {tab === "overview" &&
        (user ? (
          <DriverOverview user={user} />
        ) : (
          isFetching && <Skeleton className="h-64 w-full rounded-2xl" />
        ))}

      {tab === "documents" && <DriverDocuments userId={params.id} />}

      {tab === "wallet" && <UserWallet userId={params.id} />}
    </div>
  );
}

export default function DriverDetailPage() {
  return (
    <Suspense fallback={null}>
      <DriverDetail />
    </Suspense>
  );
}
