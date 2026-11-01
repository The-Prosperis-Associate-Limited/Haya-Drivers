"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { DriverSearchResult } from "@/types/driver";
import { DriverCardShell } from "./driver-card";

interface Props {
  driver: DriverSearchResult;
}

export const TalentCard = function ({ driver }: Props) {
  return (
    <DriverCardShell
      driver={driver}
      actions={
        <Button asChild className="h-10 rounded-xl px-5">
          <Link href={`/dashboard/drivers/${driver.userId}`}>View profile</Link>
        </Button>
      }
    />
  );
};
