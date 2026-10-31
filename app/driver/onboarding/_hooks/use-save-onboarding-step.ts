import { useSubmitData } from "@/hooks/use-submit-data";
import type { APIResponse } from "@/types/response";
import type { DriverProfile } from "@/types/driver";

/*
  Every step saves the same way: PUT the step, refetch the profile the wizard
  reads onboarding_step from, then move on. Passing the next path here rather
  than navigating in the component keeps a step page to a form and nothing else.
  A step opened from the review screen's Edit link (?from=review) returns there
  after saving instead of marching through the remaining steps again. The query
  is read off window rather than useSearchParams - the hook version forces a
  Suspense boundary into every step page at prerender time.
*/
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
