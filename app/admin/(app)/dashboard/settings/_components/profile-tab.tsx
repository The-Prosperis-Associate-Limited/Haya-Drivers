"use client";

import { AppAvatar } from "@/components/shared/app-avatar";
import { AppText } from "@/components/shared/app-text";
import { StatusBadge } from "@/components/shared/status-badge";
import { FormInput } from "@/components/form/form-input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProfile } from "@/hooks/use-get-profile";
import { useSubmitData } from "@/hooks/use-submit-data";
import { ADMIN_ROLE_LABELS, personName } from "@/lib/admin";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, Mail, Phone } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const profileSchema = z.object({
  first_name: z.string().trim().min(2, "Enter your first name"),
  last_name: z.string().trim().min(2, "Enter your last name"),
  phone_no: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{7,14}$/, "Use international format, e.g. +2348012345678")
    .or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfileTab = function () {
  const { profile, isFetching, refetch } = useGetProfile();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (!profile) return;

    reset({
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      phone_no: profile.phone_no ?? "",
    });
  }, [profile, reset]);

  const { mutate: updateProfile, isPending } = useSubmitData<ProfileFormValues>(
    {
      url: API_ENDPOINTS.auth.updateProfile,
      method: "put",
      onSuccessMessage: "Profile updated",
      onSuccess: () => refetch(),
    },
  );

  if (isFetching && !profile) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  return (
    <div className="space-y-6">
      <div className="border-border flex flex-col items-center gap-4 rounded-2xl border bg-white p-5 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:flex-row sm:text-left">
        <div className="relative">
          <AppAvatar
            src={profile?.profile_pic ?? undefined}
            fallback={profile ? personName(profile) : "Admin"}
            className="h-20 w-20"
          />
          <BadgeCheck className="text-brand absolute right-0 bottom-0 h-5 w-5 rounded-full bg-white" />
        </div>

        <div className="min-w-0">
          <AppText type="h3" className="text-lg font-semibold">
            {profile ? personName(profile) : "-"}
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            {profile?.email}
          </AppText>
          <StatusBadge
            label={
              profile?.admin_profile
                ? ADMIN_ROLE_LABELS[profile.admin_profile.admin_role]
                : "Super Admin"
            }
            className="border-brand/30 bg-brand-soft text-brand mt-2"
          />
        </div>
      </div>

      <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
        <AppText type="h3" className="text-base font-semibold">
          Admin details
        </AppText>

        <div className="text-muted-foreground mt-3 flex flex-col gap-2 text-sm">
          <span className="inline-flex items-center gap-2">
            <Mail className="h-4 w-4" /> {profile?.email}
          </span>
          <span className="inline-flex items-center gap-2">
            <Phone className="h-4 w-4" />{" "}
            {profile?.phone_no ?? "No phone number yet"}
          </span>
        </div>

        <form
          onSubmit={handleSubmit((data) => updateProfile(data))}
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <FormInput<ProfileFormValues>
            control={control}
            name="first_name"
            errors={errors}
            label="First name"
            placeholder="E.g John"
          />
          <FormInput<ProfileFormValues>
            control={control}
            name="last_name"
            errors={errors}
            label="Last name"
            placeholder="E.g Doe"
          />
          <FormInput<ProfileFormValues>
            control={control}
            name="phone_no"
            errors={errors}
            label="Phone number"
            placeholder="E.g +2348012345678"
          />

          <div className="flex items-end justify-end sm:col-start-2">
            <Button isLoading={isPending} className="h-11">
              Make changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
