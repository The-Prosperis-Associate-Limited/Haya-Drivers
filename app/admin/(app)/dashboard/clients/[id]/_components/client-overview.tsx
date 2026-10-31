"use client";

import { AppAvatar } from "@/components/shared/app-avatar";
import { AppText } from "@/components/shared/app-text";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  clientName,
  statusBadgeClass,
  statusLabel,
  tegatDisplayId,
} from "@/lib/admin";
import { formatDate } from "@/lib/utils";
import type { AdminUserDetail } from "@/types/admin";
import { DetailCard, DetailRow } from "../../../../_components/detail-card";

interface Props {
  user: AdminUserDetail;
}

export const ClientOverview = function ({ user }: Props) {
  const profile = user.client_profile;
  const organisation = profile?.client_type === "ORGANISATION";

  return (
    <div className="space-y-6">
      <div className="border-border grid grid-cols-1 gap-6 rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col items-center text-center">
          <AppAvatar
            src={user.profile_pic ?? undefined}
            fallback={clientName(user)}
            className="h-28 w-28"
          />

          <AppText type="h3" className="mt-3 text-lg font-semibold">
            {clientName(user)}
          </AppText>

          <div className="mt-2 flex items-center gap-2">
            <AppText type="caption" className="text-brand font-medium">
              Haya Drivers ID: {tegatDisplayId(user.id, "CLIENT")}
            </AppText>
            <StatusBadge
              label={statusLabel(user.account_status)}
              className={statusBadgeClass(user.account_status)}
            />
          </div>
        </div>

        <div className="divide-border divide-y">
          <DetailRow
            label="Type"
            value={organisation ? "Organization" : "Individual"}
          />
          <DetailRow
            label="Contact name"
            value={[user.first_name, user.last_name].filter(Boolean).join(" ")}
          />
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Phone" value={user.phone_no} />
          <DetailRow label="Joined" value={formatDate(user.createdAt)} />
          <DetailRow
            label="Email verified"
            value={
              <StatusBadge
                label={user.has_validated_email ? "Verified" : "Unverified"}
                className={statusBadgeClass(
                  user.has_validated_email ? "APPROVED" : "PENDING",
                )}
              />
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {organisation && (
          <DetailCard
            title="Organization"
            subtitle="Company details from signup"
          >
            <DetailRow
              label="Company name"
              value={profile?.organisation_name}
            />
            <DetailRow
              label="Company size"
              value={
                profile?.organisation_size
                  ? `${profile.organisation_size} people`
                  : null
              }
            />
            <DetailRow label="Industry" value={profile?.industry} />
          </DetailCard>
        )}

        <DetailCard
          title="Hiring preferences"
          subtitle="Collected by the onboarding wizard - optional"
        >
          <DetailRow
            label="Driver categories"
            value={
              profile?.hiring_categories.length
                ? profile.hiring_categories
                    .map((category) => statusLabel(category))
                    .join(", ")
                : null
            }
          />
          <DetailRow
            label="Drivers needed"
            value={
              profile?.drivers_needed
                ? statusLabel(profile.drivers_needed)
                : null
            }
          />
          <DetailRow
            label="Assignment type"
            value={
              profile?.assignment_type
                ? statusLabel(profile.assignment_type)
                : null
            }
          />
          <DetailRow
            label="Primary location"
            value={profile?.primary_location}
          />
          <DetailRow
            label="Onboarding completed"
            value={
              profile?.onboarding_completed_at
                ? formatDate(profile.onboarding_completed_at)
                : "Skipped"
            }
          />
        </DetailCard>
      </div>
    </div>
  );
};
