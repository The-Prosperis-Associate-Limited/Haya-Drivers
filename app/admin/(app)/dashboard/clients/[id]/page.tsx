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
import { ActivityTimeline } from "../../../_components/activity-timeline";
import { DeleteAccountButton } from "../../../_components/delete-account-button";
import { ClientOverview } from "./_components/client-overview";

type Tab = "overview" | "activity";

const TABS: { value: Tab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "activity", label: "Activity Log" },
];

function ClientDetail() {
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
      <BackLink href="/admin/dashboard/clients" label="Back to clients" />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <AppText
            type="h2"
            className="text-[22px] font-semibold tracking-tight"
          >
            Know your Client.
          </AppText>
          <AppText
            type="subtitle"
            className="text-muted-foreground text-[13px]"
          >
            Review the client's profile and account activity.
          </AppText>
        </div>
        {user && (
          <DeleteAccountButton
            userId={params.id}
            name={
              [user.first_name, user.last_name].filter(Boolean).join(" ") ||
              "this client"
            }
            backHref="/admin/dashboard/clients"
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
          <ClientOverview user={user} />
        ) : (
          isFetching && <Skeleton className="h-64 w-full rounded-2xl" />
        ))}

      {tab === "activity" && <ActivityTimeline userId={params.id} />}
    </div>
  );
}

export default function ClientDetailPage() {
  return (
    <Suspense fallback={null}>
      <ClientDetail />
    </Suspense>
  );
}
