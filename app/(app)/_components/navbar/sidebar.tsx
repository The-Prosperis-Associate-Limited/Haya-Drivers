"use client";

import { NavContent } from "./nav-content";

interface Props {
  user?: Parameters<typeof NavContent>[0]["user"];
}

export const Sidebar = function ({ user }: Props) {
  return (
    <aside className="border-border hidden h-screen w-[264px] shrink-0 border-r lg:block print:hidden">
      <NavContent user={user} />
    </aside>
  );
};
