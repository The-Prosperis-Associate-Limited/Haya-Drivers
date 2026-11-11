"use client";

import { AppText } from "@/components/shared/app-text";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { ShortlistFacts } from "@/components/shortlist/shortlist-facts";
import { cn, driverTypeLabel, formatDate, formatTimeLeft } from "@/lib/utils";
import { Timer, XCircle, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import type { APIResponse } from "@/types/response";
import type { DriverShortlist } from "@/types/hire";

export const ShortlistCard = function () {
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const { data } = useGetData<APIResponse<DriverShortlist[]>>({
    url: API_ENDPOINTS.shortlists.list,
  });

  const shortlists = (data?.data ?? []).filter(
    (entry) => !entry.respond_by || new Date(entry.respond_by).getTime() > now,
  );

  const { mutate: respond, isPending } = useSubmitData<{
    available: boolean;
    id: string;
  }>({
    url: (payload) => API_ENDPOINTS.shortlists.respond(payload.id),
    onSuccessMessage: "Response sent",
    onSuccess: () => setDecliningId(null),
  });

  if (!shortlists.length) return null;

  return (
    <div className="space-y-4 rounded-2xl border border-[#c9d8fd] bg-gradient-to-b from-[#f3f7ff] to-white p-4 md:p-5">
      <div className="flex items-start gap-3">
        <span className="bg-brand grid size-10 shrink-0 place-items-center rounded-xl text-white">
          <Zap className="size-5" />
        </span>
        <div>
          <AppText type="h4" className="text-[15px] font-semibold">
            {shortlists.length > 1
              ? `You've been shortlisted for ${shortlists.length} jobs`
              : "You've been shortlisted for a job"}
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            A client is hiring and you're a candidate. Quick replies keep you at
            the top of the list.
          </AppText>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {shortlists.map((entry) => {
          const request = entry.hire_request;
          return (
            <div
              key={entry.id}
              className="border-border flex flex-col gap-3 rounded-xl border bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <AppText type="label" className="text-sm font-semibold">
                  {driverTypeLabel(request.driver_type ?? undefined)}
                  {request.duration_months
                    ? ` · ${request.duration_months} month${request.duration_months > 1 ? "s" : ""}`
                    : ""}
                </AppText>
                <span className="bg-brand-soft text-brand rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold">
                  Starts {formatDate(request.starts_at)}
                </span>
              </div>

              <ShortlistFacts request={request} />

              {entry.respond_by && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[11.5px] font-semibold",
                    new Date(entry.respond_by).getTime() - now < 2 * 3_600_000
                      ? "text-red-500"
                      : "text-amber-600",
                  )}
                >
                  <Timer className="size-3.5" />
                  Reply within {formatTimeLeft(entry.respond_by, now)}
                </span>
              )}

              <div className="mt-auto flex gap-2">
                <Button
                  className="h-9 flex-1 rounded-xl text-xs"
                  isLoading={isPending && decliningId === null}
                  onClick={() => respond({ id: entry.id, available: true })}
                >
                  I'm available
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive border-destructive/30 h-9 flex-1 rounded-xl text-xs"
                  onClick={() => setDecliningId(entry.id)}
                >
                  Not available
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={decliningId !== null}
        onOpenChange={(open) => !open && setDecliningId(null)}
        icon={XCircle}
        iconClassName="text-destructive"
        title="Mark yourself as not available?"
        description="The team will pick another driver for this engagement. This won't affect your profile or trust score."
        confirmLabel="Not available"
        confirmVariant="destructive"
        isLoading={isPending}
        onConfirm={() =>
          decliningId && respond({ id: decliningId, available: false })
        }
      />
    </div>
  );
};
