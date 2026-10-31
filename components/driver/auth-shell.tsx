"use client";

import { AuthShell as SharedAuthShell } from "@/components/shared/auth-shell";

export { AuthHeading } from "@/components/shared/auth-shell";

interface Props {
  children: React.ReactNode;
  backHref?: string;
}

export const AuthShell = function ({ children, backHref }: Props) {
  return (
    <SharedAuthShell surface="driver" backHref={backHref}>
      {children}
    </SharedAuthShell>
  );
};
