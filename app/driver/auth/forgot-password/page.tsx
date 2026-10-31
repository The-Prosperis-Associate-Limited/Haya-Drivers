"use client";

import { FormInput } from "@/components/form/form-input";
import { AuthHeading, AuthShell } from "@/components/driver/auth-shell";
import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/schemas/auth/password";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useForgotPassword } from "./_hooks/use-forgot-password";

export default function ForgotPassword() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const { forgotPassword, isPending } = useForgotPassword({
    onSuccess: () => reset(),
  });

  return (
    <AuthShell backHref="/driver/auth/signin">
      <AuthHeading
        title="Reset your password"
        subtitle="Enter the email tied to your account and we'll send you a reset link."
      />

      <form
        onSubmit={handleSubmit((data) => forgotPassword(data))}
        className="space-y-5"
      >
        <FormInput<ForgotPasswordFormValues>
          control={control}
          name="email"
          errors={errors}
          label="Email Address"
          placeholder="E.g johndoe@gmail.com"
          type="email"
          icon={Mail}
        />

        <Button
          isLoading={isPending}
          className="h-12 w-full rounded-lg text-sm"
        >
          Send reset link
        </Button>
      </form>

      <AppText type="caption" className="mt-6 block text-center">
        Remembered it?{" "}
        <Link
          href="/driver/auth/signin"
          className="text-brand font-semibold underline underline-offset-2"
        >
          Back to sign in
        </Link>
      </AppText>
    </AuthShell>
  );
}
