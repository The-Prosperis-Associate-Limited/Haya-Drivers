"use client";

import { AppAvatar } from "@/components/shared/app-avatar";
import { AppText } from "@/components/shared/app-text";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  personName,
  statusBadgeClass,
  statusLabel,
  tegatDisplayId,
} from "@/lib/admin";
import { ACADEMIC_LEVEL_OPTIONS, formatDate } from "@/lib/utils";
import { BadgeCheck } from "lucide-react";
import type { AdminUserDetail } from "@/types/admin";
import { DetailCard, DetailRow } from "../../../../_components/detail-card";

interface Props {
  user: AdminUserDetail;
}

export const DriverOverview = function ({ user }: Props) {
  const profile = user.driver_profile;
  const verification = user.driver_verification;
  const verified = verification?.status === "APPROVED";

  const academicLabel =
    ACADEMIC_LEVEL_OPTIONS.find(
      (option) => option.value === profile?.academic_level,
    )?.label ?? profile?.academic_level;

  return (
    <div className="space-y-6">
      <div className="border-border grid grid-cols-1 gap-6 rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <AppAvatar
              src={user.profile_pic ?? undefined}
              fallback={personName(user)}
              className="h-28 w-28"
            />
            {verified && (
              <BadgeCheck className="text-brand absolute right-1 bottom-1 h-6 w-6 rounded-full bg-white" />
            )}
          </div>

          <AppText type="h3" className="mt-3 text-lg font-semibold">
            {personName(user)}
          </AppText>

          <div className="mt-2 flex items-center gap-2">
            <AppText type="caption" className="text-brand font-medium">
              Haya Drivers ID: {tegatDisplayId(user.id, "DRIVER")}
            </AppText>
            <StatusBadge
              label={statusLabel(user.account_status)}
              className={statusBadgeClass(user.account_status)}
            />
          </div>
        </div>

        <div className="divide-border divide-y">
          <DetailRow label="Full Name" value={personName(user)} />
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Phone" value={user.phone_no} />
          <DetailRow label="Joined" value={formatDate(user.createdAt)} />
          <DetailRow
            label="Driver licence Number"
            value={profile?.license_number}
          />
          <DetailRow
            label="KYC"
            value={
              <StatusBadge
                label={statusLabel(verification?.status ?? "UNSUBMITTED")}
                className={statusBadgeClass(
                  verification?.status ?? "UNSUBMITTED",
                )}
              />
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DetailCard
          title="Guarantor Information"
          subtitle="Person vouching for the driver's accountability"
        >
          {!profile?.guarantors.length ? (
            <AppText
              type="caption"
              className="text-muted-foreground block py-3"
            >
              No guarantor submitted yet.
            </AppText>
          ) : (
            profile.guarantors.map((guarantor) => (
              <div key={guarantor.id} className="divide-border divide-y">
                <DetailRow label="Full Name" value={guarantor.full_name} />
                <DetailRow
                  label="Relationship"
                  value={statusLabel(guarantor.relationship)}
                />
                <DetailRow label="Phone Number" value={guarantor.phone_no} />
                <DetailRow label="Home Address" value={guarantor.address} />
                <DetailRow label="NIN" value={guarantor.nin} />
              </div>
            ))
          )}
        </DetailCard>

        <DetailCard
          title="Work experience"
          subtitle="Roles the driver has held"
        >
          {!profile?.work_experiences.length ? (
            <AppText
              type="caption"
              className="text-muted-foreground block py-3"
            >
              No work experience submitted yet.
            </AppText>
          ) : (
            profile.work_experiences.map((experience) => (
              <div
                key={experience.id}
                className="flex items-start justify-between gap-4 py-3"
              >
                <div>
                  <AppText type="caption" className="block font-semibold">
                    {experience.job_title}
                  </AppText>
                  <AppText
                    type="caption"
                    className="text-muted-foreground block"
                  >
                    {experience.employer}
                  </AppText>
                </div>
                <AppText type="caption" className="text-muted-foreground">
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
      </div>

      <DetailCard title="Education" subtitle="Academic background">
        <DetailRow label="Academic level" value={academicLabel} />
        <DetailRow label="Institution" value={profile?.institution} />
        <DetailRow label="Course of study" value={profile?.course_of_study} />
      </DetailCard>
    </div>
  );
};
