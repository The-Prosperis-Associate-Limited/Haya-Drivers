import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { UserRole } from "./types/auth";

// ── Route constants ──
const ROUTES = {
  LOGIN: "/auth/signin",
  DRIVER_LOGIN: "/driver/auth/signin",
  ADMIN_LOGIN: "/admin/auth/signin",
  AUTH: "/auth",
  DRIVER_AUTH: "/driver/auth",
  ADMIN_AUTH: "/admin/auth",
  DASHBOARD: "/dashboard",
  ONBOARDING: "/onboarding",
  MARKETPLACE: "/marketplace",
  DRIVER: "/driver",
  ADMIN: "/admin",
} as const;

const AUTH_BYPASS_PATHS = [
  "/auth/email-verified",
  "/auth/reset-password",
  "/driver/auth/email-verified",
  "/driver/auth/reset-password",
  "/admin/auth/reset-password",
  "/admin/auth/change-password",
];

const SURFACE_FOR_ROLE: Record<UserRole, string> = {
  CLIENT: ROUTES.DASHBOARD,
  DRIVER: "/driver/dashboard",
  ADMIN: "/admin/dashboard",
};

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // localhost cookies are shared across ports, so another app's session_type can arrive here.
  const rawSessionType = request.cookies.get("session_type")?.value;
  const sessionType =
    rawSessionType && Object.hasOwn(SURFACE_FOR_ROLE, rawSessionType)
      ? (rawSessionType as UserRole)
      : undefined;
  const refreshToken = request.cookies.get("session_id_ref")?.value;

  const hasValidSession = !!sessionType && !!refreshToken;

  const redirectTo = (path: string) => {
    if (path.startsWith("http")) return NextResponse.redirect(path);
    return NextResponse.redirect(new URL(path, request.url));
  };

  const redirectToLogin = () => {
    const login = pathname.startsWith(ROUTES.ADMIN)
      ? ROUTES.ADMIN_LOGIN
      : pathname.startsWith(ROUTES.DRIVER)
        ? ROUTES.DRIVER_LOGIN
        : ROUTES.LOGIN;
    const loginUrl = new URL(login, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  };

  const homeForSession = () =>
    sessionType ? SURFACE_FOR_ROLE[sessionType] : ROUTES.LOGIN;

  if (AUTH_BYPASS_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith(ROUTES.ADMIN_AUTH) ||
    pathname.startsWith(ROUTES.DRIVER_AUTH) ||
    pathname.startsWith(ROUTES.AUTH)
  ) {
    return hasValidSession ? redirectTo(homeForSession()) : NextResponse.next();
  }

  // The admin area: everything except its auth pages needs an admin session.
  if (pathname.startsWith(ROUTES.ADMIN)) {
    if (!hasValidSession) return redirectToLogin();
    if (sessionType !== "ADMIN") return redirectTo(homeForSession());
    return NextResponse.next();
  }

  // The driver area: everything except its auth pages needs a driver session.
  if (pathname.startsWith(ROUTES.DRIVER)) {
    if (!hasValidSession) return redirectToLogin();
    if (sessionType !== "DRIVER") return redirectTo(homeForSession());
    return NextResponse.next();
  }

  if (
    pathname.startsWith(ROUTES.DASHBOARD) ||
    pathname.startsWith(ROUTES.ONBOARDING) ||
    pathname.startsWith(ROUTES.MARKETPLACE)
  ) {
    if (!hasValidSession) return redirectToLogin();

    // A signed-in driver or admin never reaches a client screen.
    if (sessionType !== "CLIENT") return redirectTo(homeForSession());
  }

  return NextResponse.next();
}

// "/" is the public landing page, so it is not matched.
export const config = {
  matcher: [
    "/auth/:path*",
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/marketplace/:path*",
    "/driver/:path*",
    "/admin/:path*",
  ],
};
