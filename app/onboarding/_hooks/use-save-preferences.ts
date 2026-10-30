import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { APIResponse } from "@/types/response";
import type { ClientProfile } from "@/types/auth";

// Every step saves through this one hook - partial payload, refetches the
// preferences query so the next step prefills without a reload.
export const useSavePreferences = function ({
  redirectTo,
  onSuccess,
}: {
  redirectTo?: string;
  onSuccess?: () => void;
}) {
  const { mutate, isPending } = useSubmitData<
    Partial<ClientProfile>,
    APIResponse<ClientProfile>
  >({
    url: API_ENDPOINTS.onboarding.preferences,
    method: "put",
    // The profile query feeds the sidebar link and the dashboard prompt card.
    onSuccessMessage: "Saved",
    redirectTo,
    onSuccess,
  });

  return { save: mutate, isPending };
};

export const useCompleteOnboarding = function ({
  silent,
}: { silent?: boolean } = {}) {
  const { mutate, isPending } = useSubmitData<
    Record<string, never> | undefined,
    APIResponse<ClientProfile>
  >({
    url: API_ENDPOINTS.onboarding.complete,
    method: "post",
    onSuccessMessage: "You're all set",
    redirectTo: "/dashboard",
    silent,
  });

  return { complete: mutate, isPending };
};
