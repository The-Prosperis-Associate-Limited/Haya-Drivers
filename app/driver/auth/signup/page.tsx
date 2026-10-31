"use client";

import { FormInput } from "@/components/form/form-input";
import { AuthHeading, AuthShell } from "@/components/driver/auth-shell";
import { AppText } from "@/components/shared/app-text";
import { GoogleAuthButton } from "@/components/shared/google-auth-button";
import { OrDemacator } from "@/components/shared/or-demacator";
import { PasswordChecklist } from "@/components/shared/password-checklist";
import { ReferralCodeField } from "@/components/driver/referral-code-field";
import { Button } from "@/components/ui/button";
import type { ReferralCodeState } from "@/hooks/use-referral-code-preview";
import { normaliseReferralCode } from "@/hooks/use-referral-code-preview";
import { clearStashedReferralCode, stashReferralCode } from "@/lib/referral-stash";
import { showToast } from "@/lib/show-toast";
import { ENV } from "@/lib/utils";
import {
  signupSchema,
  type SignupFormValues,
} from "@/schemas/auth/driver-signup";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSignup } from "./_hooks/use-signup";

function SignUpForm() {
  const router = useRouter();
  const invite = normaliseReferralCode(useSearchParams().get("ref") ?? "");

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { accepted_terms: false, referral_code: invite },
  });

  const [codeLocked, setCodeLocked] = useState(!!invite);
  const [codeState, setCodeState] = useState<ReferralCodeState>("empty");

  useEffect(() => {
    if (invite) stashReferralCode(invite);
  }, [invite]);

  const password = watch("password") ?? "";
  const email = watch("email") ?? "";

  const { signup, isPending } = useSignup({
    onSuccess: () =>
      router.push(
        `/driver/auth/verify-email?email=${encodeURIComponent(email)}`,
      ),
  });

  const onSubmit = (data: SignupFormValues) => {
    if (codeState === "invalid" || codeState === "checking") {
      return showToast("error", codeState === "checking" ? "Checking your referral code - try again in a moment" : "Fix or remove the referral code first");
    }

    clearStashedReferralCode();
    // "mobile" asks the server for a 6-digit code rather than the emailed link,
    // which is what the next screen collects.
    signup({ ...data, referral_code: data.referral_code ? normaliseReferralCode(data.referral_code) : undefined, role: "DRIVER", client: "mobile" });
  };

  return (
    <AuthShell backHref="/">
      <AuthHeading
        title="Create your driver account"
        subtitle="Takes about 2 minutes. You'll verify your documents in the next step."
      />

      <GoogleAuthButton
        onClick={() => router.push(`${ENV.API_URL}/auth/google/driver`)}
      />

      <OrDemacator />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormInput<SignupFormValues>
          control={control}
          name="full_name"
          errors={errors}
          label="Full name"
          placeholder="E.g John Doe"
          icon={UserRound}
        />

        <FormInput<SignupFormValues>
          control={control}
          name="email"
          errors={errors}
          label="Email Address"
          placeholder="E.g johndoe@gmail.com"
          type="email"
          icon={Mail}
        />

        <div className="space-y-3">
          <FormInput<SignupFormValues>
            control={control}
            name="password"
            errors={errors}
            label="Password"
            placeholder="Create a password"
            type="password"
          />

          <PasswordChecklist password={password} />
        </div>

        <Controller
          control={control}
          name="referral_code"
          render={({ field }) => (
            <ReferralCodeField
              value={field.value ?? ""}
              onChange={field.onChange}
              locked={codeLocked}
              onUnlock={() => {
                setCodeLocked(false);
                setValue("referral_code", "");
                clearStashedReferralCode();
              }}
              label={codeLocked ? "Invited by a driver" : undefined}
              onStateChange={setCodeState}
            />
          )}
        />

        <FormInput<SignupFormValues>
          control={control}
          name="accepted_terms"
          errors={errors}
          type="checkbox"
          id="accepted_terms"
          label={
            <>
              I agree to Haya Drivers's{" "}
              <Link
                href="/terms"
                target="_blank"
                className="text-brand underline underline-offset-2"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                target="_blank"
                className="text-brand underline underline-offset-2"
              >
                Privacy Policy
              </Link>
            </>
          }
        />

        <Button
          isLoading={isPending}
          className="h-12 w-full rounded-lg text-sm"
        >
          Continue
        </Button>
      </form>

      <AppText type="caption" className="mt-6 block text-center">
        Already have an account?{" "}
        <Link
          href="/driver/auth/signin"
          className="text-brand font-semibold underline underline-offset-2"
        >
          Sign in
        </Link>
      </AppText>
    </AuthShell>
  );
}

export default function SignUp() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
