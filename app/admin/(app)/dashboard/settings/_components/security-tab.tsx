"use client";

import { AppText } from "@/components/shared/app-text";
import { FormInput } from "@/components/form/form-input";
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

export const SecurityTab = function () {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const password = watch("new_password") ?? "";

  const { mutate: updatePassword, isPending } = useSubmitData<{
    current_password: string;
    new_password: string;
  }>({
    url: API_ENDPOINTS.auth.updatePassword,
    method: "put",
    onSuccessMessage: "Password updated",
    onSuccess: () => reset(),
  });

  return (
    <div className="border-border max-w-xl rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
      <AppText type="h3" className="text-base font-semibold">
        Security
      </AppText>
      <AppText type="caption" className="text-muted-foreground block">
        Update the password you sign in to the console with.
      </AppText>

      <form
        onSubmit={handleSubmit(({ current_password, new_password }) =>
          updatePassword({ current_password, new_password }),
        )}
        className="mt-6 space-y-4"
      >
        <FormInput<UpdatePasswordFormValues>
          control={control}
          name="current_password"
          errors={errors}
          label="Current password"
          placeholder="Enter your current password"
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

        <Button isLoading={isPending} className="h-11">
          Make changes
        </Button>
      </form>
    </div>
  );
};
