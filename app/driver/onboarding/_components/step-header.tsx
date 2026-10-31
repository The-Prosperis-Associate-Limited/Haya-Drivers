import { ONBOARDING_RAIL_LABELS } from "@/components/shared/onboarding-shell";
import { ONBOARDING_STEPS } from "@/lib/utils";
import type { OnboardingStep } from "@/types/driver";

interface Props {
  step: OnboardingStep;
  title: string;
  description?: string;
}

export const StepHeader = function ({ step, title, description }: Props) {
  const index = ONBOARDING_STEPS.findIndex((entry) => entry.step === step);

  return (
    <div className="mb-6">
      <span className="text-brand text-xs font-semibold tracking-[0.1em] uppercase">
        Step {index + 1} · {ONBOARDING_RAIL_LABELS[step]}
      </span>
      <h1 className="mt-1.5 text-[26px] leading-tight font-semibold tracking-tight lg:text-[30px]">{title}</h1>
      {description && <p className="text-muted-foreground mt-1.5 text-sm">{description}</p>}
    </div>
  );
};
