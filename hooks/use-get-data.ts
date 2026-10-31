import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useHandleErrors } from "../lib/handle-errors";
import { useCallback, useEffect } from "react";
import api, { CustomAxiosRequestConfig } from "../lib/api";

interface Props {
  url: string;
  skipAuth?: boolean;
  shouldFetch?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchOnMount?: boolean | "always";
  refetchInterval?: number;
  silentErrors?: boolean;
  retry?: boolean | number;
}

interface UseGetDataResult<T> {
  isFetching: boolean;
  data: T | undefined;
  refetch: () => void;
  error: Error | null;
}

export const useGetData = <T>({
  url,
  skipAuth = false,
  shouldFetch = true,
  staleTime = 5 * 60 * 1000,
  gcTime = 10 * 60 * 1000,
  refetchOnMount = true,
  refetchInterval,
  silentErrors = false,
  retry,
}: Props): UseGetDataResult<T> => {
  const handleErrors = useHandleErrors();

  // const finalQueryKey =
  //   queryKey && queryKey?.length > 0 ? queryKey : [url, skipAuth];

  const queryKey = [url];

  const queryFn = useCallback(async () => {
    try {
      const response = await api.get(url, {
        skipAuth,
      } as CustomAxiosRequestConfig);
      return response.data;
    } catch (error: any) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || "An error occurred");
      } else {
        throw new Error(error.message || "An unexpected error occurred");
      }
    }
  }, [url, skipAuth]);

  const { isFetching, error, data, refetch } = useQuery({
    queryKey: queryKey,
    queryFn,
    staleTime,
    gcTime,
    refetchOnMount,
    refetchOnWindowFocus: true,
    refetchInterval,
    enabled: shouldFetch, // Conditionally enable the API call
    ...(retry !== undefined && { retry }),
  });

  // Handle errors outside of the render cycle
  useEffect(() => {
    if (error && !silentErrors) {
      handleErrors(error as AxiosError<{ message?: string }>);
    }
  }, [error, handleErrors, silentErrors]);

  return { isFetching, data, refetch, error };
};
