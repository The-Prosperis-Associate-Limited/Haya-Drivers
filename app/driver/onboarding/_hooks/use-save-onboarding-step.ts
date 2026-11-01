import { useSubmitData } from "@/hooks/use-submit-data";
import type { APIResponse } from "@/types/response";
import type { DriverProfile } from "@/types/driver";

// Reads ?from=review off window - useSearchParams would force a Suspense boundary into every step page at prerender.
export const useSaveOnboardingStep = function <TData>({
  url,
  redirectTo,
  onSuccessMessage = "Saved",
}: {
  url: string;
  redirectTo: string;
  onSuccessMessage?: string;
}) {
  const fromReview =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("from") === "review";

  const { mutate, isPending } = useSubmitData<
    TData,
    APIResponse<DriverProfile>
  >({
    url,
    method: "put",
    onSuccessMessage,
    redirectTo: fromReview ? "/driver/onboarding/review" : redirectTo,
  });

  return { save: mutate, isPending };
};
