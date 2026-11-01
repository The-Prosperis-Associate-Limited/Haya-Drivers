import { useRouter } from "next/navigation";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { APIResponse } from "@/types/response";
import type { SignupFormValues } from "@/schemas/auth/signup";

type SignupPayload = SignupFormValues & { role: "CLIENT" };

export const useSignup = function () {
  const router = useRouter();

  const { mutate, isPending } = useSubmitData<
    SignupFormValues,
    APIResponse<null>
  >({
    url: API_ENDPOINTS.auth.signup,
    method: "post",
    skipAuth: true,
    getBody: (data): SignupPayload => ({ ...data, role: "CLIENT" }),
    onSuccessMessage: "Account created. Check your email to verify it.",
    onSuccess: () => router.push("/auth/signin"),
  });

  return { signup: mutate, isPending };
};
