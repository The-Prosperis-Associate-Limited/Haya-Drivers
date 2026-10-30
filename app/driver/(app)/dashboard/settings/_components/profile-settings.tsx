"use client";

import { FormInput } from "@/components/form/form-input";
import { FormTextarea } from "@/components/form/form-textarea";
import { AppText } from "@/components/shared/app-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useGetProfile } from "@/hooks/use-get-profile";
import { useIsClient } from "@/hooks/use-is-client";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { showToast } from "@/lib/show-toast";
import { getInitials } from "@/lib/utils";
import { BadgeCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

interface ProfileFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone_no: string;
  bio: string;
}

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export const ProfileSettings = function () {
  const { profile } = useGetProfile();
  const fileInput = useRef<HTMLInputElement>(null);
  // The picked file lives in state, not on the ref - submit runs during render
  // and must not read the input back out of the DOM.
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const status = profile?.driver_profile?.verification_status;
  // Settings hydrates inside a Suspense boundary after the layout has already cached the profile.
  const isClient = useIsClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
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

  // Revoking on unmount rather than on every change would leak one url per pick.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const { mutate: updateProfile, isPending } = useSubmitData<FormData>({
    url: API_ENDPOINTS.auth.updateProfile,
    method: "put",
    onSuccessMessage: "Profile updated",
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

  const pickAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > MAX_AVATAR_BYTES) {
      showToast("error", "That image is larger than 5MB");
      event.target.value = "";
      return;
    }

    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeAvatar = () => {
    if (fileInput.current) fileInput.current.value = "";
    setAvatar(null);
    setPreview(null);
  };

  return (
    <form
      onSubmit={handleSubmit(save)}
      className="border-border rounded-2xl border bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-4"
    >
      <div className="border-border grid grid-cols-1 divide-y rounded-lg border md:grid-cols-2 md:divide-x md:divide-y-0">
        <div className="flex flex-col items-center justify-center gap-5 p-6 md:p-10">
          <div className="relative">
            <Avatar className="h-40 w-40 md:h-52 md:w-52">
              <AvatarImage
                src={preview ?? profile?.profile_pic ?? undefined}
                alt=""
              />
              <AvatarFallback className="text-3xl">
                {getInitials(profile?.first_name, profile?.last_name)}
              </AvatarFallback>
            </Avatar>

            {isClient && status === "APPROVED" && (
              <BadgeCheck className="fill-brand absolute right-2 bottom-2 h-8 w-8 text-white" />
            )}
          </div>

          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={pickAvatar}
            className="hidden"
          />

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => fileInput.current?.click()}
              className="bg-brand-soft text-brand hover:bg-brand-soft/70 h-10 rounded-lg px-5"
            >
              Upload new
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={removeAvatar}
              className="h-10 rounded-lg px-5"
            >
              Remove
            </Button>
          </div>
        </div>

        <div className="space-y-4 p-6 md:p-10">
          <AppText type="h4" className="text-[15px] font-semibold">
            Personal details
          </AppText>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </div>

          <FormInput<ProfileFormValues>
            control={control}
            name="email"
            errors={errors}
            label="Email address"
            disabled
          />

          <FormInput<ProfileFormValues>
            control={control}
            name="phone_no"
            errors={errors}
            label="Phone number"
            placeholder="+234"
          />

          {/* Rendered as the About section on the client marketplace profile. */}
          <FormTextarea<ProfileFormValues>
            control={control}
            name="bio"
            errors={errors}
            label="About you"
            placeholder="Tell clients about your experience, strengths and how you work."
            rows={4}
            maxLength={600}
          />

          <Button isLoading={isPending} className="h-12 w-full rounded-lg">
            Make changes
          </Button>
        </div>
      </div>
    </form>
  );
};
