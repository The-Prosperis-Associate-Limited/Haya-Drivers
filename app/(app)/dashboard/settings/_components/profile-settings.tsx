"use client";

import { FormInput } from "@/components/form/form-input";
import { FormPhoneInput } from "@/components/form/form-phone-input";
import { ProfilePhotoCard } from "@/components/settings/profile-photo-card";
import { SettingsCard } from "@/components/settings/settings-card";
import { Button } from "@/components/ui/button";
import { useGetProfile } from "@/hooks/use-get-profile";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface ProfileFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone_no: string;
}

export const ProfileSettings = function () {
  const { profile } = useGetProfile();
  // The picked file lives in state - submit must not read it back out of the DOM.
  const [avatar, setAvatar] = useState<File | null>(null);
  const [photoKey, setPhotoKey] = useState(0);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>();

  useEffect(() => {
    if (!profile) return;

    reset({
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      email: profile.email ?? "",
      phone_no: profile.phone_no ?? "",
    });
  }, [profile, reset]);

  const { mutate: updateProfile, isPending } = useSubmitData<FormData>({
    url: API_ENDPOINTS.auth.updateProfile,
    method: "put",
    onSuccessMessage: "Profile updated",
    onSuccess: () => {
      setAvatar(null);
      setPhotoKey((key) => key + 1);
    },
  });

  const save = (data: ProfileFormValues) => {
    const body = new FormData();

    body.append("first_name", data.first_name);
    body.append("last_name", data.last_name);
    body.append("phone_no", data.phone_no);

    if (avatar) body.append("profile_pic", avatar);

    updateProfile(body);
  };

  const organisation = profile?.client_profile?.organisation_name;

  return (
    <form
      onSubmit={handleSubmit(save)}
      className="grid items-start gap-4 lg:grid-cols-[280px_minmax(0,1fr)]"
    >
      <ProfilePhotoCard
        key={photoKey}
        firstName={profile?.first_name}
        lastName={profile?.last_name}
        email={profile?.email}
        photoUrl={profile?.profile_pic}
        roleLabel={organisation ?? "Client"}
        onPick={setAvatar}
      />

      <SettingsCard
        title="Personal details"
        description="Drivers you hire see your name and phone number once the hire is confirmed - nobody else does."
        icon={UserRound}
        footer={
          <Button
            isLoading={isPending}
            disabled={!isDirty && !avatar}
            className="h-10 rounded-xl px-5"
          >
            Save changes
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput<ProfileFormValues>
            control={control}
            name="first_name"
            errors={errors}
            label="First name"
          />
          <FormInput<ProfileFormValues>
            control={control}
            name="last_name"
            errors={errors}
            label="Last name"
          />
          <FormInput<ProfileFormValues>
            control={control}
            name="email"
            errors={errors}
            label="Email address"
            disabled
          />
          <FormPhoneInput<ProfileFormValues>
            control={control}
            name="phone_no"
            errors={errors}
            label="Phone number"
          />
        </div>
      </SettingsCard>
    </form>
  );
};
