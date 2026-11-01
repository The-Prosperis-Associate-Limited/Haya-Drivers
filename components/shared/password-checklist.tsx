import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppText } from "./app-text";

interface Props {
  password: string;
}

const RULES = [
  {
    label: "At least 8 characters",
    test: (value: string) => value.length >= 8,
  },
  {
    label: "At least one letter",
    test: (value: string) => /[A-Za-z]/.test(value),
  },
  { label: "At least one number", test: (value: string) => /\d/.test(value) },
  {
    label: "At least one special character",
    test: (value: string) => /[@$!%*?&#^()\-_=+.]/.test(value),
  },
];

const strengthFor = function (passed: number) {
  if (passed <= 1) return { label: "Too weak", tone: "text-destructive" };
  if (passed === 2) return { label: "Weak", tone: "text-amber-600" };
  if (passed === 3) return { label: "Almost there", tone: "text-amber-600" };
  return { label: "Strong", tone: "text-emerald-600" };
};

export const PasswordChecklist = function ({ password }: Props) {
  const results = RULES.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }));
  const strength = strengthFor(results.filter((rule) => rule.passed).length);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <AppText type="caption" className="text-muted-foreground">
          Your password must include:
        </AppText>
        <AppText type="caption" className={cn("font-medium", strength.tone)}>
          {strength.label}
        </AppText>
      </div>

      <ul className="space-y-1.5">
        {results.map((rule) => (
          <li key={rule.label} className="flex items-center gap-2">
            <CheckCircle2
              className={cn(
                "h-4 w-4 shrink-0",
                rule.passed ? "text-emerald-600" : "text-muted-foreground/40",
              )}
            />
            <AppText
              type="caption"
              className={
                rule.passed ? "text-foreground" : "text-muted-foreground"
              }
            >
              {rule.label}
            </AppText>
          </li>
        ))}
      </ul>
    </div>
  );
};
