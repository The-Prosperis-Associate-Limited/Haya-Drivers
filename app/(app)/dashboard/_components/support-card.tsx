"use client";

import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import { useSupportSheet } from "@/store/use-support-sheet";
import { MessageSquare } from "lucide-react";

export const SupportCard = function () {
  const openSupport = useSupportSheet((state) => state.setOpen);

  return (
    <div className="bg-ink flex items-center gap-3.5 rounded-2xl p-4 text-white md:p-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10">
        <MessageSquare className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <AppText type="label" className="block font-semibold text-white">
          Talk to our team
        </AppText>
        <AppText type="caption" className="block text-white/70">
          Live chat, report an issue or reach us directly
        </AppText>
      </div>
      <Button
        onClick={() => openSupport(true)}
        variant="ghost"
        className="text-brand h-9 shrink-0 rounded-xl bg-white px-4 text-xs hover:bg-white/90"
      >
        Chat
      </Button>
    </div>
  );
};
