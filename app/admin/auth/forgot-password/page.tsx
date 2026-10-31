"use client";

import { FormInput } from "@/components/form/form-input";
import { AuthHeading, AuthShell } from "@/components/shared/auth-shell";
import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/schemas/auth/password";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import type { APIResponse } from "@/types/response";

export default function AdminForgotPassword() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const { mutate: forgotPassword, isPending } = useSubmitData<
    ForgotPasswordFormValues,
    APIResponse<null>
  >({
    url: API_ENDPOINTS.auth.forgotPassword,
    method: "post",
    skipAuth: true,
    onSuccessMessage: "If that account exists, a reset link is on its way",
    onSuccess: () => reset(),
  });

  return (
    <AuthShell surface="admin">
      <AuthHeading
        title="Reset your password"
        subtitle="Enter the email tied to your admin account and we'll send you a reset link."
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
          href="/admin/auth/signin"
          className="text-brand font-semibold underline underline-offset-2"
        >
          Back to sign in
        </Link>
      </AppText>
    </AuthShell>
  );
}
