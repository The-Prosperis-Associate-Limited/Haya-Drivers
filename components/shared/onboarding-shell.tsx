"use client";

import { Check, Headset, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TegatLogo } from "@/components/svg/logo";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useOnboardingProfile } from "@/hooks/use-onboarding-profile";
import { ONBOARDING_STEPS, cn } from "@/lib/utils";
import type { OnboardingStep } from "@/types/driver";

const TIP_INTERVAL_MS = 8000;

export const ONBOARDING_RAIL_LABELS: Record<OnboardingStep, string> = {
  PERSONAL_INFORMATION: "Personal information",
  EXPERIENCE: "Driving experience",
  ACADEMIC_QUALIFICATION: "Education",
  WORK_EXPERIENCE: "Work history",
  GUARANTORS: "Guarantor & reference",
  ADDITIONAL_INFORMATION: "About you",
  DOCUMENTS: "Documents",
  REVIEW: "Review & submit",
};

const WHY: Record<OnboardingStep | "STATUS", string> = {
  PERSONAL_INFORMATION: "Your name and date of birth are matched against your NIN slip. Your phone number is only shared with a client once they've hired you.",
  EXPERIENCE: "Clients see your experience and licence classes when they search. Your licence number is only seen by our verification team.",
  ACADEMIC_QUALIFICATION: "Education isn't required to get verified - it just gives clients a fuller picture of you.",
  WORK_EXPERIENCE: "Past driving jobs are the first thing clients read on your profile. Even a short role counts.",
  GUARANTORS: "A guarantor is the strongest trust signal a client sees. We call every guarantor before a driver is verified.",
  ADDITIONAL_INFORMATION: "Some clients look for drivers who speak a particular language. Everything on this step is optional.",
  DOCUMENTS: "We match your NIN slip and licence against the details you gave. A clear photo is the fastest way through review.",
  REVIEW: "Once you submit, our team reviews everything together. You can still edit your details while you wait.",
  STATUS: "You can use your dashboard while you wait - referrals and your profile are open to every driver.",
};

const RotatingTip = function ({ tips }: { tips: string[] }) {
  const [index, setIndex] = useState(0);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (tips.length < 2) return;
    const timer = setInterval(() => setIndex((current) => current + 1), TIP_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [tips.length]);

  return (
    <p key={index} className={cn("mt-3 border-t border-white/15 pt-3 text-[12px] text-white/70", !prefersReducedMotion && "animate-in fade-in duration-500")}>
      <b className="font-semibold text-white">Tip: </b>
      {tips[index % tips.length]}
    </p>
  );
};

export interface OnboardingFooter {
  label: string;
  formId?: string;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  hint?: string;
  hideBack?: boolean;
  secondary?: React.ReactNode;
}

interface Props {
  children: React.ReactNode;
  step: OnboardingStep | "STATUS";
  tips?: string[];
  footer?: OnboardingFooter;
  className?: string;
}

export const OnboardingShell = function ({ children, step, tips, footer, className }: Props) {
  const router = useRouter();
  const { profile } = useOnboardingProfile();

  const submitted = !!profile && profile.verification_status !== "UNSUBMITTED";
  const reachedIndex = submitted ? ONBOARDING_STEPS.length : Math.max(0, ONBOARDING_STEPS.findIndex((entry) => entry.step === profile?.onboarding_step));
  const currentIndex = step === "STATUS" ? ONBOARDING_STEPS.length : ONBOARDING_STEPS.findIndex((entry) => entry.step === step);
  const previous = currentIndex > 0 ? ONBOARDING_STEPS[currentIndex - 1] : null;
  const total = ONBOARDING_STEPS.length;

  return (
    <div className="grid min-h-screen grid-cols-[minmax(0,1fr)] bg-[#f8fafc] lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="from-brand relative isolate hidden h-screen flex-col overflow-y-auto bg-linear-to-b via-[#1f56d9] to-[#1a46b3] px-6 py-7 text-white lg:sticky lg:top-0 lg:flex">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_140%_at_100%_0%,#5b8cff_0%,transparent_55%)]" />
        <Image src="/cloud-top-right.svg" alt="" width={260} height={100} className="pointer-events-none absolute -top-2 -right-16 -z-10 w-[240px] opacity-25" />

        <Link href="/driver/dashboard" className="flex w-fit items-center gap-2.5 font-bold">
          <span className="grid size-9 place-items-center rounded-xl bg-white">
            <TegatLogo size={24} />
          </span>
          <span className="leading-tight">
            Haya Drivers
            <span className="block text-[11px] font-medium text-white/70">Driver verification</span>
          </span>
        </Link>

        <h2 className="mt-8 text-[22px] font-semibold tracking-tight">Hi {profile?.user.first_name ?? "there"} 👋</h2>
        <p className="mt-1 text-[13px] text-white/75">About 10 minutes. Every step saves as you go, so you can stop and come back.</p>

        <ol className="mt-6 grid gap-0.5">
          {ONBOARDING_STEPS.map((entry, index) => {
            const done = index < reachedIndex && index !== currentIndex;
            const now = index === currentIndex;
            const reachable = index <= reachedIndex;
            const content = (
              <>
                <span
                  className={cn(
                    "relative z-[1] grid size-7 shrink-0 place-items-center rounded-full border-[1.5px] border-white/40 bg-[#2559e6] text-[11.5px] font-bold",
                    done && "text-brand border-white bg-white",
                    now && "border-white shadow-[0_0_0_4px_rgba(255,255,255,0.18)]",
                  )}
                >
                  {done ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate">{ONBOARDING_RAIL_LABELS[entry.step]}</span>
                {entry.step === "ADDITIONAL_INFORMATION" && <span className="text-[11px] font-medium text-white/60">Optional</span>}
              </>
            );
            const classes = cn(
              "relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13.5px] text-white/70",
              index < total - 1 && "after:absolute after:top-[38px] after:-bottom-1 after:left-[23px] after:w-[1.5px] after:bg-white/20",
              done && "text-white",
              now && "bg-white/15 font-semibold text-white",
              reachable && !now && "hover:bg-white/10",
            );

            return (
              <li key={entry.step}>
                {reachable && !now && !submitted ? (
                  <Link href={entry.path} className={classes}>
                    {content}
                  </Link>
                ) : (
                  <div className={classes} aria-current={now ? "step" : undefined}>
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-auto rounded-2xl border border-white/20 bg-white/10 p-4 text-[12.5px] text-white/85">
          <p className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-white">
            <ShieldCheck className="size-4" />
            Why we ask
          </p>
          {WHY[step]}
          {!!tips?.length && <RotatingTip tips={tips} />}
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="border-border sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-white/90 px-4 backdrop-blur md:px-8">
          <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.12em] whitespace-nowrap">
            {step === "STATUS" ? "APPLICATION" : `STEP ${currentIndex + 1} OF ${total}`}
          </span>
          <span className="bg-muted h-1.5 max-w-[220px] flex-1 overflow-hidden rounded-full">
            <i className="bg-brand block h-full rounded-full transition-all" style={{ width: `${(Math.min(currentIndex + 1, total) / total) * 100}%` }} />
          </span>
          <span className="ml-auto hidden items-center gap-1.5 text-xs font-medium text-emerald-600 sm:flex">
            <Check className="size-3.5" />
            Progress saves as you go
          </span>
          <Link href="/driver/dashboard/support" aria-label="Help" className="hover:bg-muted ml-auto grid size-10 place-items-center rounded-xl sm:ml-0">
            <Headset className="size-5" />
          </Link>
        </header>

        <main className={cn("mx-auto w-full max-w-[760px] flex-1 px-4 pt-6 pb-32 sm:px-6 sm:pt-9", className)}>
          {step !== "STATUS" && (
            <div className="mb-5 flex gap-1.5 lg:hidden">
              {ONBOARDING_STEPS.map((entry, index) => (
                <i key={entry.step} className={cn("h-1 flex-1 rounded-full", index <= currentIndex ? "bg-brand" : "bg-muted")} />
              ))}
            </div>
          )}
          {children}
        </main>

        {footer && (
          <footer className="border-border fixed inset-x-0 bottom-0 z-30 flex items-center gap-2.5 border-t bg-white/95 px-4 py-3 backdrop-blur lg:left-[300px] lg:px-8 xl:left-[320px]">
            {!footer.hideBack && (
              <Button
                type="button"
                variant="outline"
                onClick={() => (previous ? router.push(previous.path) : router.push("/driver/dashboard"))}
                className="h-11 rounded-xl px-5"
              >
                Back
              </Button>
            )}
            {footer.hint && <span className="text-muted-foreground hidden text-[12.5px] sm:block">{footer.hint}</span>}
            <span className="ml-auto flex items-center gap-2">
              {footer.secondary}
              <Button
                type={footer.formId ? "submit" : "button"}
                form={footer.formId}
                onClick={footer.onClick}
                disabled={footer.disabled}
                isLoading={footer.isLoading}
                className="h-11 min-w-[140px] rounded-xl px-6"
              >
                {footer.label}
              </Button>
            </span>
          </footer>
        )}
      </div>
    </div>
  );
};
