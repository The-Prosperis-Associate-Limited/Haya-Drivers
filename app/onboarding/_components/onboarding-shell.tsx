"use client";

import { Car, MapPin, ShieldCheck, UserRound, UsersRound, Wallet, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TegatLogo } from "@/components/svg/logo";
import { Button } from "@/components/ui/button";
import { useGetProfile } from "@/hooks/use-get-profile";
import {
  ASSIGNMENT_TYPE_OPTIONS,
  CLIENT_DRIVER_CATEGORY_OPTIONS,
  CLIENT_ONBOARDING_STEPS,
  DRIVERS_NEEDED_OPTIONS,
  HIRING_TIMELINE_OPTIONS,
  cn,
  formatMoney,
} from "@/lib/utils";
import type { ClientProfile } from "@/types/auth";
import { usePreferences } from "../_hooks/use-preferences";
import { useCompleteOnboarding } from "../_hooks/use-save-preferences";

interface Props {
  step: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onContinue: () => void;
  isPending?: boolean;
  continueDisabled?: boolean;
  continueLabel?: string;
}

const labelOf = (options: readonly { value: string; label: string }[], value?: string | null) => options.find((option) => option.value === value)?.label;

const briefOf = (preferences?: ClientProfile): { icon: LucideIcon; label: string; value: string | null }[] => [
  {
    icon: UserRound,
    label: "Hiring for",
    value: preferences ? (preferences.client_type === "ORGANISATION" ? (preferences.organisation_name ?? "A company") : "Myself or family") : null,
  },
  {
    icon: Car,
    label: "Drivers",
    value: preferences?.hiring_categories.length ? preferences.hiring_categories.map((value) => labelOf(CLIENT_DRIVER_CATEGORY_OPTIONS, value)?.replace(" Driver", "")).join(", ") : null,
  },
  {
    icon: UsersRound,
    label: "How many",
    value: preferences?.drivers_needed ? [labelOf(DRIVERS_NEEDED_OPTIONS, preferences.drivers_needed), labelOf(ASSIGNMENT_TYPE_OPTIONS, preferences.assignment_type)?.split(" /")[0]].filter(Boolean).join(" · ") : null,
  },
  {
    icon: MapPin,
    label: "Where & when",
    value: preferences?.primary_location ? [preferences.primary_location, labelOf(HIRING_TIMELINE_OPTIONS, preferences.hiring_timeline)].filter(Boolean).join(" · ") : null,
  },
  {
    icon: Wallet,
    label: "Budget",
    value: preferences?.monthly_budget ? `${formatMoney(preferences.monthly_budget, "NGN")}/mo` : null,
  },
];

export const OnboardingShell = function ({ step, title, subtitle, children, onContinue, isPending, continueDisabled, continueLabel }: Props) {
  const router = useRouter();
  const { profile } = useGetProfile();
  const { preferences } = usePreferences();

  // Skipping is completing - the wizard is a prompt, not a gate, and it must
  // not reappear on every sign-in.
  const { complete, isPending: isSkipping } = useCompleteOnboarding({ silent: true });

  const total = CLIENT_ONBOARDING_STEPS.length;
  const previousPath = CLIENT_ONBOARDING_STEPS[step - 2]?.path;

  return (
    <div className="grid min-h-screen grid-cols-[minmax(0,1fr)] bg-[#f8fafc] lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="from-brand relative isolate hidden h-screen flex-col overflow-x-hidden overflow-y-auto overscroll-contain bg-linear-to-b via-[#1f56d9] to-[#1a46b3] px-6 py-7 text-white [scrollbar-width:none] lg:sticky lg:top-0 lg:flex [&::-webkit-scrollbar]:hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(120%_140%_at_100%_0%,#5b8cff_0%,transparent_55%)]" />
          <Image src="/cloud-top-right.svg" alt="" width={260} height={100} className="absolute -top-2 -right-16 w-[240px] opacity-25" />
        </div>

        <Link href="/dashboard" className="flex w-fit items-center gap-2.5 font-bold">
          <span className="grid size-9 place-items-center rounded-xl bg-white">
            <TegatLogo size={24} />
          </span>
          <span className="leading-tight">
            Haya Drivers
            <span className="block text-[11px] font-medium text-white/70">Set up your hiring</span>
          </span>
        </Link>

        <h2 className="mt-8 text-[22px] font-semibold tracking-tight">{profile?.first_name ? `Hi ${profile.first_name} 👋` : "Welcome 👋"}</h2>
        <p className="mt-1 text-[13px] text-white/75">Five quick questions so we can show you the right drivers first. Skip any of them.</p>

        <div className="mt-6 grid gap-2" data-testid="hiring-brief">
          {briefOf(preferences).map((item) => (
            <div key={item.label} className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3 py-2.5 text-[12.5px]">
              <item.icon className="size-4 shrink-0 opacity-85" />
              <span className="shrink-0">{item.label}</span>
              <b className={cn("ml-auto min-w-0 truncate text-right font-semibold", !item.value && "font-medium text-white/55")}>{item.value ?? "Not answered"}</b>
            </div>
          ))}
        </div>

        <div className="mt-auto rounded-2xl border border-white/20 bg-white/10 p-4 text-[12.5px] text-white/85">
          <p className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-white">
            <ShieldCheck className="size-4" />
            Every driver is vetted
          </p>
          NIMC identity, FRSC licence and a confirmed guarantor - before they ever appear in your search.
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="border-border sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-white/90 px-4 backdrop-blur md:px-8">
          <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.12em] whitespace-nowrap">
            STEP {step} OF {total}
          </span>
          <span className="bg-muted h-1.5 max-w-[220px] flex-1 overflow-hidden rounded-full">
            <i className="bg-brand block h-full rounded-full transition-all" style={{ width: `${(step / total) * 100}%` }} />
          </span>
          <button
            type="button"
            onClick={() => !isSkipping && complete(undefined)}
            className="text-muted-foreground hover:text-brand ml-auto text-[13px] font-medium"
          >
            Skip setup
          </button>
        </header>

        <main className="mx-auto w-full max-w-[760px] flex-1 px-4 pt-6 pb-32 sm:px-6 sm:pt-9">
          <div className="mb-5 flex gap-1.5 lg:hidden">
            {CLIENT_ONBOARDING_STEPS.map((entry, index) => (
              <i key={entry.path} className={cn("h-1 flex-1 rounded-full", index < step ? "bg-brand" : "bg-muted")} />
            ))}
          </div>
          <span className="text-brand text-xs font-semibold tracking-[0.1em] uppercase">
            Step {step} · {CLIENT_ONBOARDING_STEPS[step - 1]?.label}
          </span>
          <h1 className="mt-1.5 text-[26px] leading-tight font-semibold tracking-tight lg:text-[30px]">{title}</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </main>

        <footer className="border-border fixed inset-x-0 bottom-0 z-30 flex items-center gap-2.5 border-t bg-white/95 px-4 py-3 backdrop-blur lg:left-[300px] lg:px-8 xl:left-[320px]">
          <Button type="button" variant="outline" className="h-11 rounded-xl px-5" onClick={() => router.push(previousPath ?? "/dashboard")}>
            Back
          </Button>
          <span className="text-muted-foreground hidden text-[12.5px] sm:block">Your answers save as you go</span>
          <span className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => !isSkipping && complete(undefined)} className="text-muted-foreground hover:text-foreground px-2 text-sm font-semibold">
              Skip
            </button>
            <Button type="button" isLoading={isPending} disabled={continueDisabled} onClick={onContinue} className="h-11 min-w-[140px] rounded-xl px-6">
              {continueLabel ?? "Continue"}
            </Button>
          </span>
        </footer>
      </div>
    </div>
  );
};
