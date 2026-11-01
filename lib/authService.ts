import Cookies from "js-cookie";
import { accessTokenExpiration } from "./api";

export const isProd = process.env.NODE_ENV === "production";

// Apex domains whose subdomains share the session cookie.
const SHARED_COOKIE_DOMAINS = [".hayadrivers.com", ".tegat.com"];

// Browsers silently drop a cookie whose Domain doesn't match the host, so other hosts (vercel.app previews) get a host-only one.
const cookieDomain = () => {
  if (!isProd || typeof window === "undefined") return undefined;

  return SHARED_COOKIE_DOMAINS.find((domain) =>
    window.location.hostname.endsWith(domain.slice(1)),
  );
};

export const cookieOpts = (expires: Date) => ({
  domain: cookieDomain(),
  secure: isProd,
  sameSite: "lax" as const,
  expires,
});

export const setAuthCookies = (data: {
  tokens: { refresh: string; access: string };
  user: "DRIVER" | "CLIENT" | "ADMIN";
}) => {
  const { tokens, user } = data;

  const refreshTokenExpiration = new Date(
    new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
  );

  Cookies.set("session_id", tokens.access, cookieOpts(accessTokenExpiration));
  Cookies.set(
    "session_id_ref",
    tokens.refresh,
    cookieOpts(refreshTokenExpiration),
  );
  Cookies.set("session_type", user, cookieOpts(refreshTokenExpiration));
};

export const clearAuthCookies = () => {
  const domainOpt = { domain: cookieDomain() };

  Cookies.remove("session_id", domainOpt);
  Cookies.remove("session_id_ref", domainOpt);
  Cookies.remove("session_type", domainOpt);

  sessionStorage.removeItem("onboardingDraft");
};
