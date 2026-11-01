import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { setAuthCookies } from "@/lib/authService";
import type { APIResponse } from "@/types/response";
import type { AuthSession } from "@/types/auth";

export const useVerifyEmail = function () {
  const { mutate, isPending } = useSubmitData<
    { email: string; code: string },
    APIResponse<AuthSession>
  >({
    url: API_ENDPOINTS.auth.verifyEmailOtp,
    method: "post",
    skipAuth: true,
    onSuccessMessage: "Email verified",
    onSuccess: (data) => {
      const { token, user } = data.data;

      setAuthCookies({
        tokens: {
          refresh: token.refreshToken,
          access: token.accessToken,
        },
        user: user.role,
      });

      window.location.href = `/driver/auth/email-verified?email=${encodeURIComponent(user.email)}`;
    },
  });

  return { verifyEmail: mutate, isPending };
};
