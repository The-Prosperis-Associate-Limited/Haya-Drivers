import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { APIResponse, PaginatedResponse } from "@/types/response";
import type { Review, ReviewSummary } from "@/types/review";

export const useReviewSummary = function () {
  const { data, isFetching } = useGetData<APIResponse<ReviewSummary>>({
    url: API_ENDPOINTS.driverReviews.summary,
  });

  return { summary: data?.data, isFetching };
};

export const useReviews = function ({
  page,
  limit,
  shouldFetch = true,
}: {
  page: number;
  limit: number;
  shouldFetch?: boolean;
}) {
  const { data, isFetching } = useGetData<PaginatedResponse<Review>>({
    url: API_ENDPOINTS.driverReviews.list({ page, limit }),
    shouldFetch,
  });

  return {
    reviews: data?.data ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    isFetching,
  };
};
