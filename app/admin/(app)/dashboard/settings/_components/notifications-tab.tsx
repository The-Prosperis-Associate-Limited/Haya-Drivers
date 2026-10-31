"use client";

import { AppText } from "@/components/shared/app-text";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { APIResponse } from "@/types/response";
import type { NotificationPreferences } from "@/types/notification";

// The only category admins receive that can be switched off; new requests, payment proofs and flags always notify.
const ITEMS: {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
}[] = [
  {
    key: "job_requests",
    label: "Hire activity",
    description:
      "Drivers replying to shortlists and invitations that expire without a reply.",
  },
];

export const NotificationsTab = function () {
  const { data, isFetching } = useGetData<APIResponse<NotificationPreferences>>(
    { url: API_ENDPOINTS.notifications.preferences },
  );

  const { mutate: savePreference } = useSubmitData<
    Partial<NotificationPreferences>
  >({
    url: API_ENDPOINTS.notifications.preferences,
    method: "put",
    onSuccessMessage: "Notification preferences updated",
  });

  const preferences = data?.data;

  if (isFetching && !preferences) {
    return <Skeleton className="h-48 w-full rounded-2xl" />;
  }

  return (
    <div className="border-border max-w-xl rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
      <AppText type="h3" className="text-base font-semibold">
        Notification preferences
      </AppText>
      <AppText type="caption" className="text-muted-foreground block">
        New hire requests, payment proofs and flagged attendance always notify
        you - they need action.
      </AppText>

      <div className="divide-border mt-4 divide-y">
        {ITEMS.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-4 py-4"
          >
            <div className="min-w-0 space-y-0.5">
              <AppText type="label" className="block">
                {item.label}
              </AppText>
              <AppText type="caption" className="text-muted-foreground block">
                {item.description}
              </AppText>
            </div>

            <Switch
              checked={preferences?.[item.key] ?? false}
              onCheckedChange={(checked) =>
                savePreference({ [item.key]: checked })
              }
              aria-label={item.label}
              className="shrink-0"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
