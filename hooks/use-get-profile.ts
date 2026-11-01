import { useGetData } from "./use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { APIResponse } from "@/types/response";
import type { User } from "@/types/auth";
import type { DriverProfile } from "@/types/driver";

type Profile = User & { driver_profile?: DriverProfile | null };

export const useGetProfile = function () {
  const { data, isFetching, refetch } = useGetData<APIResponse<Profile>>({
    url: API_ENDPOINTS.auth.getProfile,
  });

  return { profile: data?.data, isFetching, refetch };
};
