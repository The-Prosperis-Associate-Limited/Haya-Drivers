"use client";

import { AuthHeading, AuthShell } from "@/components/driver/auth-shell";
import { AppText } from "@/components/shared/app-text";
import { OtpInput } from "@/components/shared/otp-input";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/show-toast";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useResendCode } from "./_hooks/use-resend-code";
import { useVerifyEmail } from "./_hooks/use-verify-email";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");

  const { verifyEmail, isPending } = useVerifyEmail();
  const { resendCode, isPending: isResending } = useResendCode();

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (code.trim().length !== 6) {
      return showToast("error", "Enter the 6-digit code from your email");
    }

    verifyEmail({ email, code: code.trim() });
  };

  return (
    <AuthShell backHref="/driver/auth/signup">
      <AuthHeading
        title="Verify your email"
        subtitle={
          <>
            We sent a 6-digit code to{" "}
            <span className="text-brand font-medium">
              {email || "your email"}
            </span>
            . Enter it below to confirm it's you.
          </>
        }
      />

      <form onSubmit={onSubmit} className="space-y-5">
        <OtpInput value={code} onChange={setCode} disabled={isPending} />

        <AppText type="caption" className="block">
          Didn't receive it?{" "}
          <button
            type="button"
            disabled={isResending || !email}
            onClick={() => resendCode({ email })}
            className="text-brand cursor-pointer font-semibold underline underline-offset-2 disabled:opacity-50"
          >
            Resend code
          </button>
        </AppText>

        <Button
          isLoading={isPending}
          className="h-12 w-full rounded-lg text-sm"
        >
          Verify email
        </Button>

        <button
          type="button"
          onClick={() => router.push("/driver/auth/signup")}
          className="text-foreground flex w-full cursor-pointer items-center justify-center gap-2 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Use a different email
        </button>
      </form>
    </AuthShell>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
