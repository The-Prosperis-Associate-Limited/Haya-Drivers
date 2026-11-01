"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const PUBLIC_PREFIXES = [
  "/auth",
  "/driver/auth",
  "/admin/auth",
  "/terms",
  "/privacy",
];

const isPublicPath = (pathname: string) =>
  pathname === "/" ||
  pathname === "/drivers" ||
  PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export const VisitTracker = function () {
  const pathname = usePathname();

  useEffect(() => {
    if (!isPublicPath(pathname)) return;
    if (sessionStorage.getItem("visit-tracked")) return;
    sessionStorage.setItem("visit-tracked", "1");

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/visit`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
};
