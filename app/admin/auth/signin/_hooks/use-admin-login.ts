import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { setAuthCookies } from "@/lib/authService";
import { handleSigninRedirect, isSafeCallback } from "@/lib/utils";
import type { APIResponse } from "@/types/response";
import type { AuthSession } from "@/types/auth";
import type { SigninFormValues } from "@/schemas/auth/signin";

export const useAdminLogin = function ({
  onSuccess,
  callbackUrl,
}: {
  onSuccess?: () => void;
  callbackUrl: string | null;
}) {
  const { mutate, isPending } = useSubmitData<
    SigninFormValues,
    APIResponse<AuthSession>
  >({
    url: API_ENDPOINTS.auth.signin,
    method: "post",
    skipAuth: true,
    onSuccessMessage: "Logged in successfully",
    onSuccess: (data) => {
      onSuccess?.();

      const { token, user } = data.data;

      setAuthCookies({
        tokens: {
          refresh: token.refreshToken,
          access: token.accessToken,
        },
        user: user.role,
      });

      if (user.role === "ADMIN" && user.admin_profile?.must_change_password) {
        window.location.href = "/admin/auth/change-password";
        return;
      }

      const redirectPath = isSafeCallback(callbackUrl)
        ? callbackUrl
        : handleSigninRedirect(user.role);

      window.location.href = redirectPath;
    },
  });

  return { login: mutate, isPending };
};
