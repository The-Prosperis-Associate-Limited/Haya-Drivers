"use client";

import { AppText } from "@/components/shared/app-text";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { SMS_ALERTS_ENABLED } from "@/lib/utils";
import type { APIResponse } from "@/types/response";
import type { NotificationPreferences } from "@/types/notification";

type PreferenceKey = keyof NotificationPreferences;

// The preference row is shared with the driver surface; only the keys that
// mean something to a client are surfaced here.
const GROUPS: {
  title: string;
  description?: string;
  items: { key: PreferenceKey; label: string; description: string }[];
}[] = [
  {
    title: "Hiring alerts",
    description:
      "Each switch covers in-app, push and email for that kind of update.",
    items: [
      {
        key: "job_requests",
        label: "Hire & booking activity",
        description:
          "Shortlist progress, booking changes and late check-ins. Cancellations always reach you.",
      },
      {
        key: "sms_alerts",
        label: "SMS alerts",
        description: "Text me for urgent, time-sensitive updates.",
      },
      {
        key: "client_messages",
        label: "Support replies",
        description: "Replies from our support team on your chats and tickets.",
      },
    ],
  },
  {
    title: "Platform",
    items: [
      {
        key: "product_news",
        label: "Product news & tips",
        description:
          "Occasional updates about new features - only sent while this is on.",
      },
    ],
  },
];

export const NotificationSettings = function () {
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
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {GROUPS.map((group) => (
        <div
          key={group.title}
          className="border-border rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-6"
        >
          <div className="space-y-1">
            <AppText type="h4" className="text-[15px] font-semibold">
              {group.title}
            </AppText>
            {group.description && (
              <AppText type="caption" className="text-muted-foreground block">
                {group.description}
              </AppText>
            )}
          </div>

          <div className="divide-border mt-4 divide-y">
            {group.items
              .filter((item) => item.key !== "sms_alerts" || SMS_ALERTS_ENABLED)
              .map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="min-w-0 space-y-0.5">
                    <AppText type="label" className="block">
                      {item.label}
                    </AppText>
                    <AppText
                      type="caption"
                      className="text-muted-foreground block"
                    >
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
      ))}
      <AppText type="caption" className="text-muted-foreground block px-1">
        Payments, invoices, payouts and security alerts are always sent - they
        aren't optional.
      </AppText>
    </div>
  );
};
