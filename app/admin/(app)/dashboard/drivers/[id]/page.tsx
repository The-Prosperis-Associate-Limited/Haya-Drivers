"use client";

import { TrustRing } from "@/components/drivers/trust-ring";
import { AppAvatar } from "@/components/shared/app-avatar";
import { AppTabs } from "@/components/shared/app-tabs";
import { BackLink } from "@/components/shared/back-link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import {
  ADMIN_CARD,
  personName,
  statusBadgeClass,
  statusLabel,
  tegatDisplayId,
} from "@/lib/admin";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn, driverTypeLabel, formatDate, formatMoney } from "@/lib/utils";
import { BadgeCheck } from "lucide-react";
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
  { value: "documents", label: "KYC documents" },
  { value: "wallet", label: "Wallet and payments" },
];

const DriverHero = function ({
  user,
  action,
}: {
  user: AdminUserDetail;
  action: React.ReactNode;
}) {
  const profile = user.driver_profile;
  const status =
    user.driver_verification?.status ??
    profile?.verification_status ??
    "UNSUBMITTED";
  const location = [user.city, user.state_of_residence]
    .filter(Boolean)
    .join(", ");

  const facts = [
    { label: "Joined", value: formatDate(user.createdAt) },
    {
      label: "Experience",
      value:
        profile?.years_of_experience != null
          ? `${profile.years_of_experience} yrs`
          : "-",
    },
    {
      label: "Monthly rate",
      value: profile?.expected_monthly_rate
        ? formatMoney(profile.expected_monthly_rate, profile.rate_currency)
        : "Not set",
      warn: !profile?.expected_monthly_rate,
    },
    {
      label: "Haya Drivers ID",
      value: tegatDisplayId(user.id, "DRIVER"),
    },
  ];

  return (
    <div className={cn(ADMIN_CARD, "overflow-hidden")}>
      <div className="from-brand-soft/80 bg-gradient-to-r to-white p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative shrink-0">
              <AppAvatar
                src={user.profile_pic ?? undefined}
                fallback={personName(user)}
                className="size-16"
              />
              {status === "APPROVED" && (
                <BadgeCheck className="fill-brand absolute -right-0.5 -bottom-0.5 size-5 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[22px] font-semibold tracking-tight">
                {personName(user)}
              </h1>
              <p className="text-muted-foreground truncate text-[13px]">
                {[
                  profile?.driver_type && driverTypeLabel(profile.driver_type),
                  location,
                ]
                  .filter(Boolean)
                  .join(" · ") || user.email}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <StatusBadge
                  label={`Account ${statusLabel(user.account_status)}`}
                  className={statusBadgeClass(user.account_status)}
                />
                <StatusBadge
                  label={`KYC ${statusLabel(status)}`}
                  className={statusBadgeClass(status)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {profile && (
              <TrustRing
                score={profile.trust_score}
                size={64}
                strokeWidth={6}
                label={null}
                caption="trust"
                valueClassName="text-lg"
              />
            )}
            {action}
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 border-t border-slate-100 md:grid-cols-4">
        {facts.map((fact, index) => (
          <div
            key={fact.label}
            className={cn(
              "p-4 md:px-5",
              index % 2 === 1 && "border-l border-slate-100",
              index > 1 && "border-t border-slate-100 md:border-t-0",
              index > 0 && "md:border-l",
            )}
          >
            <dt className="text-muted-foreground text-xs">{fact.label}</dt>
            <dd
              className={cn(
                "mt-1 text-base font-semibold tracking-tight",
                fact.warn ? "text-amber-600" : "text-ink",
              )}
            >
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

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
    <div className="mx-auto max-w-[1360px] space-y-5">
      <BackLink href="/admin/dashboard/drivers" label="Drivers" />

      {user ? (
        <DriverHero
          user={user}
          action={
            <DeleteAccountButton
              userId={params.id}
              name={personName(user)}
              backHref="/admin/dashboard/drivers"
              anonymisedAt={user.anonymised_at}
            />
          }
        />
      ) : (
        isFetching && <Skeleton className="h-48 w-full rounded-2xl" />
      )}

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
