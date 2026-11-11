"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { AppDialog } from "@/components/shared/app-dialog";
import { AppText } from "@/components/shared/app-text";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatMoney } from "@/lib/utils";
import { CircleHelp } from "lucide-react";
import type { APIResponse } from "@/types/response";
import type { HirePricingGuide } from "@/types/hire";

export const PricingGuideDialog = function () {
  const [open, setOpen] = useState(false);

  const { data } = useGetData<APIResponse<HirePricingGuide>>({
    url: API_ENDPOINTS.adminHires.pricingGuide,
    shouldFetch: open,
  });

  const guide = data?.data;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-brand inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold hover:underline"
      >
        <CircleHelp className="h-3.5 w-3.5" />
        How is the invoice calculated?
      </button>

      <AppDialog
        isOpen={open}
        onOpenChange={setOpen}
        title="How hire pricing works"
        description="The client pays only our service fee plus VAT. Driver salaries go to the drivers directly."
        width="560px"
      >
        {!guide ? (
          <div className="space-y-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        ) : (
          <div className="space-y-5">
            <section>
              <AppText type="label" className="block text-sm font-bold">
                Full-time (monthly) hires
              </AppText>
              <AppText
                type="caption"
                className="text-muted-foreground mt-1 block text-xs"
              >
                A one-off fee of {guide.fee_percent}% of the driver&apos;s
                annual gross salary, per driver. Example: a driver on{" "}
                {formatMoney(guide.full_time.example.monthly_minor)}/month earns{" "}
                {formatMoney(guide.full_time.example.annual_minor)} a year, so
                the fee is {formatMoney(guide.full_time.example.fee_minor)}.
              </AppText>
            </section>

            <section>
              <AppText type="label" className="block text-sm font-bold">
                Contract hires
              </AppText>
              <AppText
                type="caption"
                className="text-muted-foreground mt-1 block text-xs"
              >
                The same {guide.fee_percent}%, on the whole contract&apos;s pay,
                per driver. Example: a {guide.contract.example.days}-day
                contract paying {formatMoney(guide.contract.example.pay_minor)}{" "}
                has a fee of {formatMoney(guide.contract.example.fee_minor)}.
                Client type and the number of drivers do not change the rate.
              </AppText>
            </section>

            <section>
              <AppText type="label" className="block text-sm font-bold">
                What the client is invoiced
              </AppText>
              <AppText
                type="caption"
                className="text-muted-foreground mt-1 block text-xs"
              >
                Service fee + {guide.vat_percent}% VAT on the fee. The
                driver&apos;s salary is agreed on the request and paid by the
                client to the driver directly - it never appears on our invoice.
              </AppText>
            </section>
          </div>
        )}
      </AppDialog>
    </>
  );
};
