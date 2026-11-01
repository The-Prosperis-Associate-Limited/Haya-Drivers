"use client";

import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { statusBadgeClass, statusLabel } from "@/lib/admin";
import {
  ACADEMIC_LEVEL_OPTIONS,
  TRANSMISSION_OPTIONS,
  driverTypeLabel,
  formatDate,
  formatMoney,
} from "@/lib/utils";
import { BriefcaseBusiness, ShieldCheck } from "lucide-react";
import type { AdminUserDetail } from "@/types/admin";
import { DetailCard, DetailRow } from "../../../../_components/detail-card";

interface Props {
  user: AdminUserDetail;
}

const labelOf = (
  options: { value: string; label: string }[],
  value?: string | null,
) => options.find((option) => option.value === value)?.label ?? value;

export const DriverOverview = function ({ user }: Props) {
  const profile = user.driver_profile;
  const verification = user.driver_verification;
  const status =
    verification?.status ?? profile?.verification_status ?? "UNSUBMITTED";

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-6">
      <div className="min-w-0 space-y-5 xl:space-y-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:gap-6">
          <DetailCard title="Contact" subtitle="How to reach the driver">
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Phone" value={user.phone_no} />
            <DetailRow
              label="Location"
              value={[user.city, user.state_of_residence]
                .filter(Boolean)
                .join(", ")}
            />
            <DetailRow
              label="State of origin"
              value={profile?.state_of_origin}
            />
            <DetailRow label="Joined" value={formatDate(user.createdAt)} />
          </DetailCard>

          <DetailCard title="Driving" subtitle="Experience and licence">
            <DetailRow
              label="Driver type"
              value={
                profile?.driver_type && driverTypeLabel(profile.driver_type)
              }
            />
            <DetailRow
              label="Experience"
              value={
                profile?.years_of_experience != null
                  ? `${profile.years_of_experience} yrs`
                  : null
              }
            />
            <DetailRow
              label="Transmission"
              value={labelOf(TRANSMISSION_OPTIONS, profile?.transmission)}
            />
            <DetailRow
              label="Licence classes"
              value={profile?.licence_classes.join(", ")}
            />
            <DetailRow label="Licence number" value={profile?.license_number} />
            <DetailRow
              label="Licence expiry"
              value={
                profile?.license_expires_at &&
                formatDate(profile.license_expires_at)
              }
            />
          </DetailCard>
        </div>

        <DetailCard title="Work history" subtitle="Roles the driver has held">
          {!profile?.work_experiences.length ? (
            <EmptyState
              icon={BriefcaseBusiness}
              title="No work history yet"
              description="The driver hasn't added any previous roles."
              size="compact"
            />
          ) : (
            profile.work_experiences.map((experience) => (
              <div
                key={experience.id}
                className="flex items-start justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <AppText type="label" className="block text-sm">
                    {experience.job_title}
                  </AppText>
                  <AppText
                    type="caption"
                    className="text-muted-foreground block"
                  >
                    {experience.employer}
                  </AppText>
                </div>
                <AppText
                  type="caption"
                  className="text-muted-foreground shrink-0"
                >
                  {formatDate(experience.started_at)} -{" "}
                  {experience.is_current
                    ? "Present"
                    : experience.ended_at
                      ? formatDate(experience.ended_at)
                      : "-"}
                </AppText>
              </div>
            ))
          )}
        </DetailCard>

        <DetailCard
          title="Guarantor"
          subtitle="The person vouching for the driver"
        >
          {!profile?.guarantors.length ? (
            <EmptyState
              icon={ShieldCheck}
              title="No guarantor yet"
              description="The driver hasn't added a guarantor."
              size="compact"
            />
          ) : (
            profile.guarantors.map((guarantor) => (
              <div
                key={guarantor.id}
                className="divide-border grid grid-cols-1 gap-x-10 divide-y sm:grid-cols-2 sm:divide-y-0"
              >
                <DetailRow label="Full name" value={guarantor.full_name} />
                <DetailRow
                  label="Relationship"
                  value={statusLabel(guarantor.relationship)}
                />
                <DetailRow label="Phone" value={guarantor.phone_no} />
                <DetailRow label="NIN" value={guarantor.nin} />
                <DetailRow label="Address" value={guarantor.address} />
              </div>
            ))
          )}
        </DetailCard>
      </div>

      <div className="min-w-0 space-y-5 xl:space-y-6">
        <DetailCard
          title="Verification"
          action={
            <StatusBadge
              label={statusLabel(status)}
              className={statusBadgeClass(status)}
            />
          }
        >
          <DetailRow
            label="Submitted"
            value={
              verification?.submitted_at &&
              formatDate(verification.submitted_at)
            }
          />
          <DetailRow
            label="Reviewed"
            value={
              verification?.reviewed_at
                ? formatDate(verification.reviewed_at)
                : "Not yet reviewed"
            }
          />
          <DetailRow label="Attempts" value={verification?.attempts} />
          {verification?.rejection_reason && (
            <div className="py-2.5">
              <AppText type="caption" className="text-muted-foreground block">
                Last rejection
              </AppText>
              <AppText type="caption" className="text-destructive mt-0.5 block">
                {verification.rejection_reason}
              </AppText>
            </div>
          )}
        </DetailCard>

        <DetailCard
          title="Rate and hours"
          subtitle="What clients are quoted from"
        >
          <DetailRow
            label="Monthly rate"
            value={
              profile?.expected_monthly_rate ? (
                `${formatMoney(profile.expected_monthly_rate, profile.rate_currency)} / month`
              ) : (
                <span className="text-amber-600">Not set</span>
              )
            }
          />
          {profile?.availability?.length ? (
            profile.availability.map((slot) => (
              <DetailRow
                key={slot.day_range}
                label={slot.day_range}
                value={`${slot.start} - ${slot.end}`}
              />
            ))
          ) : (
            <DetailRow label="Working hours" value="Not set" />
          )}
          <DetailRow
            label="Open to work"
            value={profile?.open_to_work === false ? "No" : "Yes"}
          />
        </DetailCard>

        <DetailCard title="Education">
          <DetailRow
            label="Level"
            value={labelOf(ACADEMIC_LEVEL_OPTIONS, profile?.academic_level)}
          />
          <DetailRow label="Institution" value={profile?.institution} />
          <DetailRow label="Course" value={profile?.course_of_study} />
        </DetailCard>
      </div>
    </div>
  );
};
