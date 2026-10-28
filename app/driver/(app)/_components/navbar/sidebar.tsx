"use client";

import type { DriverVerificationStatus } from "@/types/driver";
import { NavContent } from "./nav-content";

interface Props {
  status?: DriverVerificationStatus;
  user?: Parameters<typeof NavContent>[0]["user"];
}

export const Sidebar = function ({ status, user }: Props) {
  return (
    <aside className="border-border hidden h-screen w-[264px] shrink-0 border-r lg:block print:hidden">
      <NavContent status={status} user={user} />
    </aside>
  );
};
