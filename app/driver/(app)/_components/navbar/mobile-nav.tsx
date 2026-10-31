"use client";

import { AppSheet } from "@/components/shared/app-sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import type { DriverVerificationStatus } from "@/types/driver";
import { NavContent } from "./nav-content";

interface Props {
  status?: DriverVerificationStatus;
  user?: Parameters<typeof NavContent>[0]["user"];
}

// The sidebar becomes a drawer below lg. The designs are desktop-only, so this
// is ours to decide - the nav is identical, it just slides in.
export const MobileNav = function ({ status, user }: Props) {
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
        <NavContent
          status={status}
          user={user}
          onNavigate={() => setOpen(false)}
        />
      </AppSheet>
    </>
  );
};
