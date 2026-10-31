import { useDebounce } from "@/hooks/use-debounce";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { APIResponse } from "@/types/response";

export interface OnboardingInsights {
  location: string | null;
  nearby_count: number;
  scope: "local" | "national";
  market: {
    scope: "local" | "national";
    low_minor: number;
    median_minor: number;
    high_minor: number;
    min_minor: number;
    max_minor: number;
    sample: number;
  } | null;
  budget_minor: number | null;
  within_budget_count: number | null;
  within_budget_pct: number | null;
  matches: {
    id: string;
    name: string;
    profile_pic: string | null;
    driver_type: string | null;
    years_of_experience: number | null;
    location: string | null;
    trust_score: number;
    expected_monthly_rate: number | null;
  }[];
  currency: string;
}

export const useOnboardingInsights = function ({
  location,
  budget,
  categories,
  shouldFetch = true,
}: {
  location?: string | null;
  budget?: number | null;
  categories?: string[];
  shouldFetch?: boolean;
}) {
  const debouncedLocation = useDebounce(location ?? "", 500);
  const debouncedBudget = useDebounce(budget ?? null, 400);

  const { data, isFetching } = useGetData<APIResponse<OnboardingInsights>>({
    url: API_ENDPOINTS.onboarding.insights({ location: debouncedLocation, budget: debouncedBudget, categories }),
    shouldFetch,
    silentErrors: true,
    retry: false,
  });

  return { insights: data?.data, isFetching };
};
