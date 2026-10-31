"use client";

import { FormInput } from "@/components/form/form-input";
import { AuthHeading, AuthShell } from "@/components/driver/auth-shell";
import { AppText } from "@/components/shared/app-text";
import { GoogleAuthButton } from "@/components/shared/google-auth-button";
import { OrDemacator } from "@/components/shared/or-demacator";
import { Button } from "@/components/ui/button";
import { setAuthCookies } from "@/lib/authService";
import { showToast } from "@/lib/show-toast";
import { ENV, handleSigninRedirect, isSafeCallback } from "@/lib/utils";
import { signinSchema, type SigninFormValues } from "@/schemas/auth/signin";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useGetGoogleSession } from "./_hooks/use-get-google-session";
import { useLogin } from "./_hooks/use-login";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const callbackUrl = searchParams.get("callbackUrl");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SigninFormValues>({ resolver: zodResolver(signinSchema) });

  const { login, isPending } = useLogin({
    callbackUrl,
    onSuccess: () => reset(),
  });

  const { sessionData } = useGetGoogleSession(token ?? "");

  useEffect(() => {
    if (!sessionData) return;

    setAuthCookies({
      tokens: {
        refresh: sessionData.token.refreshToken,
        access: sessionData.token.accessToken,
      },
      user: sessionData.user.role,
    });

    reset();

    const redirectPath = isSafeCallback(callbackUrl)
      ? callbackUrl
      : handleSigninRedirect(sessionData.user.role);

    window.location.href = redirectPath;

    showToast("success", "You're in");
  }, [sessionData, reset, callbackUrl]);

  const onSubmit = (data: SigninFormValues) => login(data);

  return (
    <AuthShell backHref="/">
      <AuthHeading
        title="Sign in to Haya Drivers"
        subtitle="Enter your details to access your account."
      />

      <GoogleAuthButton
        onClick={() => router.push(`${ENV.API_URL}/auth/google/driver`)}
      />

      <OrDemacator />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormInput<SigninFormValues>
          control={control}
          name="email"
          errors={errors}
          label="Email Address"
          placeholder="E.g johndoe@gmail.com"
          type="email"
          icon={Mail}
        />

        <FormInput<SigninFormValues>
          control={control}
          name="password"
          errors={errors}
          label="Password"
          placeholder="Enter your password"
          type="password"
        />

        <Link
          href="/driver/auth/forgot-password"
          className="text-brand block text-sm font-semibold hover:underline"
        >
          Forgotten Password?
        </Link>

        <Button
          isLoading={isPending}
          className="h-12 w-full rounded-lg text-sm"
        >
          Continue
        </Button>
      </form>

      <AppText type="caption" className="mt-6 block text-center">
        Don't have an account?{" "}
        <Link
          href="/driver/auth/signup"
          className="text-brand font-semibold underline underline-offset-2"
        >
          Create an account
        </Link>
      </AppText>
    </AuthShell>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
