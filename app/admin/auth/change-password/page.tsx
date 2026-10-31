"use client";

import { FormInput } from "@/components/form/form-input";
import { AuthHeading, AuthShell } from "@/components/shared/auth-shell";
import { PasswordChecklist } from "@/components/shared/password-checklist";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  updatePasswordSchema,
  type UpdatePasswordFormValues,
} from "@/schemas/auth/password";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { APIResponse } from "@/types/response";

// The screen an invited admin lands on straight after first sign-in: every
// /api/admin route is refused until the temporary password is rotated here.
export default function AdminChangePassword() {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const password = watch("new_password") ?? "";

  const { mutate: changePassword, isPending } = useSubmitData<
    { current_password: string; new_password: string },
    APIResponse<null>
  >({
    url: API_ENDPOINTS.auth.updatePassword,
    method: "put",
    onSuccessMessage: "Password updated - welcome aboard",
    redirectTo: "/admin/dashboard",
  });

  return (
    <AuthShell surface="admin">
      <AuthHeading
        title="Set your own password"
        subtitle="You signed in with a temporary password. Choose your own before continuing - it expires after this first use."
      />

      <form
        onSubmit={handleSubmit(({ current_password, new_password }) =>
          changePassword({ current_password, new_password }),
        )}
        className="space-y-5"
      >
        <FormInput<UpdatePasswordFormValues>
          control={control}
          name="current_password"
          errors={errors}
          label="Temporary password"
          placeholder="The password you signed in with"
          type="password"
        />

        <div className="space-y-3">
          <FormInput<UpdatePasswordFormValues>
            control={control}
            name="new_password"
            errors={errors}
            label="New password"
            placeholder="Enter a new password"
            type="password"
          />

          <PasswordChecklist password={password} />
        </div>

        <FormInput<UpdatePasswordFormValues>
          control={control}
          name="confirm_password"
          errors={errors}
          label="Confirm new password"
          placeholder="Repeat your new password"
          type="password"
        />

        <Button
          isLoading={isPending}
          className="h-12 w-full rounded-lg text-sm"
        >
          Update password
        </Button>
      </form>
    </AuthShell>
  );
}
