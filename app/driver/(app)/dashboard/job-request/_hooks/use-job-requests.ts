import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { APIResponse, PaginatedResponse } from "@/types/response";
import type { AttendanceLog } from "@/types/attendance";
import type { SalarySchedule } from "@/types/salary";
import type {
  Booking,
  JobRequestBucket,
  JobRequestSummary,
} from "@/types/booking";

export const useJobRequests = function ({
  page,
  limit,
  bucket,
  shouldFetch = true,
}: {
  page: number;
  limit: number;
  bucket?: JobRequestBucket;
  shouldFetch?: boolean;
}) {
  const { data, isFetching } = useGetData<PaginatedResponse<Booking>>({
    url: API_ENDPOINTS.jobRequests.list({ page, limit, bucket }),
    shouldFetch,
  });

  return {
    bookings: data?.data ?? [],
    totalPages: data?.totalPages ?? 1,
    total: data?.total ?? 0,
    isFetching,
  };
};

// Every endpoint on this router 403s an unverified driver, so the screen asks
// before it fetches rather than toasting two rejections at them.
export const useJobRequestSummary = function (shouldFetch = true) {
  const { data, isFetching } = useGetData<APIResponse<JobRequestSummary>>({
    url: API_ENDPOINTS.jobRequests.summary,
    shouldFetch,
  });

  return { summary: data?.data, isFetching };
};

export const useJobRequest = function (reference: string, shouldFetch = true) {
  const { data, isFetching } = useGetData<APIResponse<Booking>>({
    url: API_ENDPOINTS.jobRequests.get(reference),
    shouldFetch: shouldFetch && !!reference,
  });

  return { booking: data?.data, isFetching };
};

const useBookingAction = function ({
  url,
  onSuccessMessage,
  method = "patch",
}: {
  url: string;
  onSuccessMessage: string;
  method?: "patch" | "post";
}) {
  return useSubmitData<Record<string, unknown>, APIResponse<Booking>>({
    url,
    method,
    onSuccessMessage,
  });
};

export const useStartJob = function (reference: string) {
  const { mutate, isPending } = useBookingAction({
    url: API_ENDPOINTS.jobRequests.start(reference),
    onSuccessMessage: "Job started",
  });

  return { startJob: mutate, isPending };
};

export const useCompleteJob = function (reference: string) {
  const { mutate, isPending } = useBookingAction({
    url: API_ENDPOINTS.jobRequests.complete(reference),
    onSuccessMessage: "Job marked complete",
  });

  return { completeJob: mutate, isPending };
};

export const useCheckIn = function (reference: string) {
  const { mutate, isPending } = useBookingAction({
    url: API_ENDPOINTS.jobRequests.checkIn(reference),
    onSuccessMessage: "Checked in - have a good day",
    method: "post",
  });

  return { checkIn: mutate, isPending };
};

export const useCheckOut = function (reference: string) {
  const { mutate, isPending } = useBookingAction({
    url: API_ENDPOINTS.jobRequests.checkOut(reference),
    onSuccessMessage: "Checked out",
    method: "post",
  });

  return { checkOut: mutate, isPending };
};

export const useAttendanceLog = function (reference: string, month: string) {
  const { data, isFetching } = useGetData<APIResponse<AttendanceLog>>({
    url: API_ENDPOINTS.jobRequests.attendance(reference, month),
    shouldFetch: !!reference,
  });

  return { log: data?.data, isFetching };
};

export const useJobSalary = function (reference: string) {
  const { data, isFetching } = useGetData<APIResponse<SalarySchedule>>({
    url: API_ENDPOINTS.jobRequests.salary(reference),
    shouldFetch: !!reference,
  });

  return { schedule: data?.data, isFetching };
};
