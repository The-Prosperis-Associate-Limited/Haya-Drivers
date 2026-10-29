"use client";

import { AppSheet } from "@/components/shared/app-sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { AdminNavContent } from "./nav-content";

interface Props {
  user?: Parameters<typeof AdminNavContent>[0]["user"];
}

export const AdminMobileNav = function ({ user }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <AppSheet
        isOpen={open}
        onOpenChange={setOpen}
        side="left"
        title="Navigation"
        width="284px"
        bodyClassName="p-0"
      >
        <AdminNavContent user={user} onNavigate={() => setOpen(false)} />
      </AppSheet>
    </>
  );
};
