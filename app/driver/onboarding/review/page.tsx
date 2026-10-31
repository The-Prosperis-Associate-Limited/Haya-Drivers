"use client";

import { ReferralAttachCard } from "@/components/driver/referral-attach-card";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { getVerificationReadiness } from "@/components/verification/verification-review";
import { useGetDocuments } from "@/hooks/use-documents";
import { useOnboardingProfile } from "@/hooks/use-onboarding-profile";
import { useSubmitOnboarding } from "@/hooks/use-submit-onboarding";
import { showToast } from "@/lib/show-toast";
import { ACADEMIC_LEVEL_OPTIONS, ONBOARDING_TIPS, TRANSMISSION_OPTIONS, cn, driverTypeLabel } from "@/lib/utils";
import { BadgeCheck, Check, Minus, TriangleAlert, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StepHeader } from "../_components/step-header";
import { StepNote, StepPanel } from "../_components/step-panel";

const labelOf = (options: { value: string; label: string }[], value?: string | null) => options.find((option) => option.value === value)?.label;

export default function ReviewStep() {
  const router = useRouter();
  const { profile } = useOnboardingProfile();
  const { documents } = useGetDocuments();
  const { submitOnboarding, isPending } = useSubmitOnboarding();
  const [confirmed, setConfirmed] = useState(false);

  const { hasPersonal, hasExperience, hasDocuments, canSubmit } = getVerificationReadiness(profile, documents);
  const status = profile?.verification_status;
  // Every step saves as it goes, so a driver already under review or verified is only editing - there is nothing to submit again.
  const alreadySubmitted = status === "PENDING" || status === "APPROVED";
  const rejectedDocs = documents.filter((document) => document.status === "REJECTED");

  const user = profile?.user;
  const rows = [
    {
      label: "Personal information",
      detail: hasPersonal ? [user?.state_of_residence, user?.phone_no].filter(Boolean).join(" · ") : "Phone, date of birth and country are needed",
      done: hasPersonal,
      href: "/driver/onboarding/personal-information",
    },
    {
      label: "Driving experience",
      detail: hasExperience
        ? [driverTypeLabel(profile?.driver_type), labelOf(TRANSMISSION_OPTIONS, profile?.transmission), profile?.licence_classes?.length ? `Class ${profile.licence_classes.join(", ")}` : null].filter(Boolean).join(" · ")
        : "Driver type and licence number are needed",
      done: hasExperience,
      href: "/driver/onboarding/experience",
    },
    {
      label: "Education",
      detail: [labelOf(ACADEMIC_LEVEL_OPTIONS, profile?.academic_level), profile?.institution].filter(Boolean).join(" · ") || "Skipped",
      done: !!profile?.academic_level,
      optional: true,
      href: "/driver/onboarding/academic-qualification",
    },
    {
      label: "Work history",
      detail: profile?.work_experiences.length ? `${profile.work_experiences.length} role${profile.work_experiences.length === 1 ? "" : "s"}` : "No roles added",
      done: !!profile?.work_experiences.length,
      optional: true,
      href: "/driver/onboarding/work-experience",
    },
    {
      label: "Guarantor & reference",
      detail: profile?.guarantors.length ? [profile.guarantors[0].full_name, profile.reference?.full_name].filter(Boolean).join(" · ") : "Not added yet",
      done: !!profile?.guarantors.length,
      optional: true,
      href: "/driver/onboarding/guarantors",
    },
    {
      label: "About you",
      detail: profile?.languages?.length ? profile.languages.join(", ") : "Skipped",
      done: !!profile?.languages?.length,
      optional: true,
      href: "/driver/onboarding/additional-information",
    },
    {
      label: "Documents",
      detail: rejectedDocs.length ? `${rejectedDocs.length} to replace` : `${documents.length} uploaded`,
      done: hasDocuments && !rejectedDocs.length,
      warn: !!rejectedDocs.length,
      href: "/driver/onboarding/documents",
    },
  ];

  const finish = () => {
    if (alreadySubmitted) {
      showToast("success", "Your changes are saved");
      return router.push("/driver/dashboard");
    }
    if (!confirmed) return showToast("error", "Tick the box to confirm your details are true");
    submitOnboarding({});
  };

  return (
    <OnboardingShell
      step="REVIEW"
      tips={ONBOARDING_TIPS.REVIEW}
      footer={{
        label: alreadySubmitted ? "Save and finish" : status === "REJECTED" ? "Resubmit for verification" : "Submit for verification",
        onClick: finish,
        isLoading: isPending,
        disabled: !alreadySubmitted && (!canSubmit || !!rejectedDocs.length),
        hint: alreadySubmitted ? "Your changes are already saved" : "Reviews take 24-48 hours",
      }}
    >
      <StepHeader
        step="REVIEW"
        title={alreadySubmitted ? "Review your details" : "Check everything, then submit"}
        description={
          status === "APPROVED"
            ? "You're verified - your changes are already saved. Documents can only be changed through support."
            : status === "PENDING"
              ? "Your application is with our team. Your changes are already saved and they'll see them."
              : "Our team reviews applications in 24-48 hours. You'll get an email and a notification either way."
        }
      />

      <div className="space-y-3.5">
        <StepPanel>
          <ul className="divide-border divide-y" data-testid="review-checklist">
            {rows.map((row) => (
              <li key={row.label} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  className={cn(
                    "grid size-[22px] shrink-0 place-items-center rounded-full",
                    row.warn ? "bg-red-100 text-red-600" : row.done ? "bg-emerald-50 text-emerald-600" : row.optional ? "border-[1.5px] border-dashed border-slate-300 text-slate-400" : "bg-amber-50 text-amber-600",
                  )}
                >
                  {row.warn ? <TriangleAlert className="size-3" /> : row.done ? <Check className="size-3" strokeWidth={3} /> : row.optional ? <Minus className="size-3" /> : <TriangleAlert className="size-3" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-medium">{row.label}</span>
                  <span className={cn("block truncate text-xs", row.warn ? "text-red-600" : "text-muted-foreground")}>{row.detail}</span>
                </span>
                {!(status === "APPROVED" && row.label === "Documents") && (
                  <Link href={`${row.href}?from=review`} className="text-brand shrink-0 text-[13px] font-semibold">
                    {row.done ? "Edit" : row.optional ? "Add" : "Finish"}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </StepPanel>

        <StepPanel title="How clients will see you" description="A preview of your profile card" icon={UserRound}>
          <div className="border-border flex items-center gap-3 rounded-2xl border p-3.5">
            <span className="bg-brand-soft text-brand grid size-12 shrink-0 place-items-center rounded-full text-[15px] font-semibold">
              {`${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase() || "?"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-semibold">{[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Your name"}</span>
              <span className="text-muted-foreground block truncate text-xs">
                {[
                  driverTypeLabel(profile?.driver_type),
                  profile?.years_of_experience != null ? `${profile.years_of_experience} yr${profile.years_of_experience === 1 ? "" : "s"}` : null,
                  labelOf(TRANSMISSION_OPTIONS, profile?.transmission),
                  user?.state_of_residence,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </span>
            <span className="bg-brand-soft text-brand hidden shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold sm:inline-flex">
              <BadgeCheck className="size-3.5" />
              {status === "APPROVED" ? "Verified" : "Verified once approved"}
            </span>
          </div>
        </StepPanel>

        {status === "UNSUBMITTED" && <ReferralAttachCard />}

        {!alreadySubmitted && !canSubmit && (
          <StepNote icon={TriangleAlert} tone="amber">
            Finish the items marked in amber before you submit.
          </StepNote>
        )}

        {!alreadySubmitted && (
          <label className="flex cursor-pointer items-start gap-3 px-0.5 pt-1 text-[13px]">
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="accent-brand mt-0.5 size-4" />
            <span>I confirm these details are true. False information means my account is removed.</span>
          </label>
        )}
      </div>
    </OnboardingShell>
  );
}
