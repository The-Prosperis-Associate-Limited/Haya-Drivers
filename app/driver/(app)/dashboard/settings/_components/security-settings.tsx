"use client";

import { FormInput } from "@/components/form/form-input";
import { AppText } from "@/components/shared/app-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useGetProfile } from "@/hooks/use-get-profile";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getInitials } from "@/lib/utils";
import {
  updatePasswordSchema,
  type UpdatePasswordFormValues,
} from "@/schemas/auth/password";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck } from "lucide-react";
import { useForm } from "react-hook-form";

export const SecuritySettings = function () {
  const { profile } = useGetProfile();

  const status = profile?.driver_profile?.verification_status;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
  });

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
    <form
      onSubmit={handleSubmit((data) => updatePassword(data))}
      className="border-border rounded-2xl border bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-4"
    >
      <div className="border-border grid grid-cols-1 divide-y rounded-lg border md:grid-cols-2 md:divide-x md:divide-y-0">
        <div className="hidden flex-col items-center justify-center p-10 md:flex">
          <div className="relative">
            <Avatar className="h-52 w-52">
              <AvatarImage src={profile?.profile_pic ?? undefined} alt="" />
              <AvatarFallback className="text-3xl">
                {getInitials(profile?.first_name, profile?.last_name)}
              </AvatarFallback>
            </Avatar>

            {status === "APPROVED" && (
              <BadgeCheck className="fill-brand absolute right-2 bottom-2 h-8 w-8 text-white" />
            )}
          </div>
        </div>

        <div className="space-y-4 p-6 md:p-10">
          <AppText type="h4" className="text-[15px] font-semibold">
            Password
          </AppText>

          <FormInput<UpdatePasswordFormValues>
            control={control}
            name="current_password"
            errors={errors}
            label="Current password"
            type="password"
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

          <Button isLoading={isPending} className="h-12 w-full rounded-lg">
            Make changes
          </Button>
        </div>
      </div>
    </form>
  );
};
