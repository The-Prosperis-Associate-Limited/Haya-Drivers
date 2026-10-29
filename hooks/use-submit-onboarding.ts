import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { APIResponse } from "@/types/response";
import type { VerificationStatus } from "@/types/driver";

// Settings resubmits in place; the wizard hands over to the status screen.
export const useSubmitOnboarding = function ({ redirect = true } = {}) {
  const { mutate, isPending } = useSubmitData<
    Record<string, never>,
    APIResponse<VerificationStatus>
  >({
    url: API_ENDPOINTS.driverOnboarding.submit,
    method: "post",
    onSuccessMessage: "Submitted for verification",
    additionalQueryKeys: [
      [API_ENDPOINTS.driverOnboarding.profile],
      [API_ENDPOINTS.driverOnboarding.verificationStatus],
    ],
    redirectTo: redirect ? "/driver/onboarding/status" : undefined,
  });

  return { submitOnboarding: mutate, isPending };
};
