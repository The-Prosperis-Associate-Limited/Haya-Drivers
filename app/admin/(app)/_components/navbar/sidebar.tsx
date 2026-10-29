"use client";

import { AdminNavContent } from "./nav-content";

interface Props {
  user?: Parameters<typeof AdminNavContent>[0]["user"];
}

export const AdminSidebar = function ({ user }: Props) {
  return (
    <aside className="border-border hidden h-screen w-[264px] shrink-0 border-r lg:block">
      <AdminNavContent user={user} />
    </aside>
  );
};
