"use client";

import { FormInput } from "@/components/form/form-input";
import { AuthHeading, AuthShell } from "@/components/shared/auth-shell";
import { PasswordChecklist } from "@/components/shared/password-checklist";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/schemas/auth/password";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import type { APIResponse } from "@/types/response";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password") ?? "";

  const { mutate: resetPassword, isPending } = useSubmitData<
    ResetPasswordFormValues,
    APIResponse<null>
  >({
    url: API_ENDPOINTS.auth.resetPassword(token),
    method: "post",
    skipAuth: true,
    onSuccessMessage: "Password reset successfully",
    redirectTo: "/admin/auth/reset-successful",
  });

  return (
    <AuthShell surface="admin">
      <AuthHeading
        title="Create a new password"
        subtitle="Choose a new password for your admin account."
      />

      <form
        onSubmit={handleSubmit((data) => resetPassword(data))}
        className="space-y-5"
      >
        <div className="space-y-3">
          <FormInput<ResetPasswordFormValues>
            control={control}
            name="password"
            errors={errors}
            label="Password"
            placeholder="Enter a new password"
            type="password"
          />

          <PasswordChecklist password={password} />
        </div>

        <FormInput<ResetPasswordFormValues>
          control={control}
          name="confirm_password"
          errors={errors}
          label="Confirm new password"
          placeholder="Repeat your new password"
          type="password"
        />

        <Button
          isLoading={isPending}
          disabled={!token}
          className="h-12 w-full rounded-lg text-sm"
        >
          Update password
        </Button>
      </form>
    </AuthShell>
  );
}

export default function AdminResetPassword() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
