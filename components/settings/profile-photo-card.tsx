"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsClient } from "@/hooks/use-is-client";
import { showToast } from "@/lib/show-toast";
import { getInitials } from "@/lib/utils";
import { BadgeCheck, Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  roleLabel: string;
  verified?: boolean;
  onPick: (file: File | null) => void;
}

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export const ProfilePhotoCard = function ({
  firstName,
  lastName,
  email,
  photoUrl,
  roleLabel,
  verified,
  onPick,
}: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const pick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_BYTES) {
      showToast("error", "That image is larger than 5MB");
      event.target.value = "";
      return;
    }

    setPreview(URL.createObjectURL(file));
    onPick(file);
  };

  const discard = () => {
    if (fileInput.current) fileInput.current.value = "";
    setPreview(null);
    onPick(null);
  };

  const name = [firstName, lastName].filter(Boolean).join(" ");
  // Settings hydrates after the layout has cached the profile, so profile text must wait for the client.
  const isClient = useIsClient();

  return (
    <section className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
      <div className="flex items-center gap-4 lg:flex-col lg:text-center">
        <div className="relative shrink-0">
          <Avatar className="size-20 lg:size-28">
            <AvatarImage src={preview ?? photoUrl ?? undefined} alt="" />
            <AvatarFallback className="text-xl lg:text-2xl">
              {getInitials(firstName, lastName)}
            </AvatarFallback>
          </Avatar>
          {verified && (
            <BadgeCheck className="fill-brand absolute right-0 bottom-0 size-6 text-white lg:size-7" />
          )}
        </div>

        {isClient ? (
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold">
              {name || "Your name"}
            </p>
            <p className="text-muted-foreground truncate text-[13px]">
              {email}
            </p>
            <span className="bg-brand-soft text-brand mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold">
              {verified ? `Verified ${roleLabel.toLowerCase()}` : roleLabel}
            </span>
          </div>
        ) : (
          <div className="w-40 space-y-2 lg:flex lg:flex-col lg:items-center">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        )}
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={pick}
        className="hidden"
      />

      <div className="border-border mt-4 flex flex-wrap gap-2 border-t pt-4 lg:justify-center">
        <Button
          type="button"
          variant="ghost"
          onClick={() => fileInput.current?.click()}
          className="bg-brand-soft text-brand hover:bg-brand-soft/70 h-10 rounded-xl px-4"
        >
          <Camera className="size-4" />
          {preview ? "Choose another" : "Upload new photo"}
        </Button>
        {preview && (
          <Button
            type="button"
            variant="outline"
            onClick={discard}
            className="h-10 rounded-xl px-4"
          >
            Discard
          </Button>
        )}
      </div>
      <p className="text-muted-foreground mt-2.5 text-xs lg:text-center">
        {preview
          ? "Saved when you save your details."
          : "JPG, PNG or WEBP, up to 5MB."}
      </p>
    </section>
  );
};
