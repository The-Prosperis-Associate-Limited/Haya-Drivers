import { useDebounce } from "./use-debounce";
import { useGetData } from "./use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { APIResponse } from "@/types/response";
import type { ReferralCodePreview } from "@/types/referral";

export const REFERRAL_CODE_PATTERN = /^[A-Z]{2,10}-[A-Z2-9]{4}$/;

export const normaliseReferralCode = (code: string) =>
  code.trim().toUpperCase().replace(/\s+/g, "");

export type ReferralCodeState = "empty" | "typing" | "checking" | "valid" | "invalid";

export const useReferralCodePreview = function (rawCode: string) {
  const code = useDebounce(normaliseReferralCode(rawCode), 400);
  const wellFormed = REFERRAL_CODE_PATTERN.test(code);

  const { data, error, isFetching } = useGetData<APIResponse<ReferralCodePreview>>({
    url: API_ENDPOINTS.auth.previewReferralCode(code),
    skipAuth: true,
    shouldFetch: wellFormed,
    silentErrors: true,
    retry: false,
  });

  const current = normaliseReferralCode(rawCode);

  let state: ReferralCodeState = "checking";
  if (!current) state = "empty";
  else if (current !== code) state = "typing";
  else if (!wellFormed) state = current.length >= 7 ? "invalid" : "typing";
  else if (isFetching) state = "checking";
  else if (error) state = "invalid";
  else if (data?.data) state = "valid";

  return { state, preview: state === "valid" ? data?.data : undefined };
};
