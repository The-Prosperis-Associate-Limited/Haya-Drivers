"use client";

import { FormInput } from "@/components/form/form-input";
import { FormPhoneInput } from "@/components/form/form-phone-input";
import { FormTextarea } from "@/components/form/form-textarea";
import { ProfilePhotoCard } from "@/components/settings/profile-photo-card";
import { SettingsCard } from "@/components/settings/settings-card";
import { Button } from "@/components/ui/button";
import { useGetProfile } from "@/hooks/use-get-profile";
import { useIsClient } from "@/hooks/use-is-client";
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
  bio: string;
}

export const ProfileSettings = function () {
  const { profile } = useGetProfile();
  // The picked file lives in state - submit must not read it back out of the DOM.
  const [avatar, setAvatar] = useState<File | null>(null);
  const [photoKey, setPhotoKey] = useState(0);

  // Settings hydrates inside a Suspense boundary after the layout has already cached the profile.
  const isClient = useIsClient();
  const verified =
    isClient && profile?.driver_profile?.verification_status === "APPROVED";

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
      bio: profile.bio ?? "",
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
    body.append("bio", data.bio);

    if (avatar) body.append("profile_pic", avatar);

    updateProfile(body);
  };

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
        roleLabel="Driver"
        verified={verified}
        onPick={setAvatar}
      />

      <SettingsCard
        title="Personal details"
        description="Your name, photo and About you appear on the profile clients see."
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
          <FormTextarea<ProfileFormValues>
            control={control}
            name="bio"
            errors={errors}
            label="About you"
            placeholder="Tell clients about your experience, strengths and how you work."
            rows={4}
            maxLength={600}
            containerClassName="sm:col-span-2"
          />
        </div>
      </SettingsCard>
    </form>
  );
};
