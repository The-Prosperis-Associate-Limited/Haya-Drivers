"use client";

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
import { KeyRound, ShieldCheck } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { SettingsCard } from "./settings-card";

const SAFETY_TIPS = [
  "Use a password you don't use on any other site.",
  "Haya Drivers will never ask for your password by phone, email or chat.",
  "Forgotten it? Sign out and use “Forgot password” on the sign-in page.",
];

export const SecuritySettings = function () {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const newPassword = useWatch({ control, name: "new_password" }) ?? "";

  const { mutate: updatePassword, isPending } =
    useSubmitData<UpdatePasswordFormValues>({
      url: API_ENDPOINTS.auth.updatePassword,
      method: "put",
      onSuccessMessage: "Password updated",
      getBody: (data) => ({
        current_password: data.current_password,
        new_password: data.new_password,
      }),
      onSuccess: () => reset(),
    });

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <form onSubmit={handleSubmit((data) => updatePassword(data))}>
        <SettingsCard
          title="Change password"
          description="You'll need your current password to set a new one."
          icon={KeyRound}
          footer={
            <Button isLoading={isPending} className="h-10 rounded-xl px-5">
              Update password
            </Button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput<UpdatePasswordFormValues>
              control={control}
              name="current_password"
              errors={errors}
              label="Current password"
              type="password"
              containerClassName="sm:col-span-2"
            />
            <FormInput<UpdatePasswordFormValues>
              control={control}
              name="new_password"
              errors={errors}
              label="New password"
              type="password"
            />
            <FormInput<UpdatePasswordFormValues>
              control={control}
              name="confirm_password"
              errors={errors}
              label="Confirm new password"
              type="password"
            />
          </div>

          {!!newPassword && (
            <div className="mt-4 rounded-xl bg-slate-50 p-3.5">
              <PasswordChecklist password={newPassword} />
            </div>
          )}
        </SettingsCard>
      </form>

      <SettingsCard title="Keeping your account safe" icon={ShieldCheck}>
        <ul className="space-y-3">
          {SAFETY_TIPS.map((tip) => (
            <li
              key={tip}
              className="text-muted-foreground flex gap-2.5 text-[13px]"
            >
              <span className="bg-brand mt-[7px] size-1.5 shrink-0 rounded-full" />
              {tip}
            </li>
          ))}
        </ul>
      </SettingsCard>
    </div>
  );
};
