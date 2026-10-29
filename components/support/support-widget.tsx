"use client";

import { AppText } from "@/components/shared/app-text";
import { FloatingLauncher } from "@/components/support/floating-launcher";
import { useGetProfile } from "@/hooks/use-get-profile";
import { useSupportSheet } from "@/store/use-support-sheet";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { ContactPanel } from "./contact-panel";
import { LiveChatPanel } from "./live-chat-panel";
import { ReportIssuePanel } from "./report-issue-panel";

interface Props {
  // Each surface remembers where its user dragged the button.
  storageKey: string;
}

// No FAQ panel on this surface yet - the client help-centre copy is unwritten.
type Panel = "menu" | "chat" | "report" | "contact";

const OPTIONS: { panel: Panel; title: string; description: string }[] = [
  {
    panel: "chat",
    title: "Live Chat",
    description: "Chat with our support team in real-time",
  },
  {
    panel: "report",
    title: "Report an issue",
    description: "Let us know about bugs or problems",
  },
  {
    panel: "contact",
    title: "Contact us",
    description: "Send us email for detailed inquires",
  },
];

const HEADINGS: Record<Panel, { title: string; description?: string }> = {
  menu: {
    title: "How can we help?",
    description: "Chat with us, report a problem or get in touch",
  },
  chat: {
    title: "Haya · Support",
    description: "Our AI assistant replies right away",
  },
  report: {
    title: "Report an Issue",
    description: "Let us know about bugs or problems",
  },
  contact: {
    title: "Contact Us",
    description: "Send us an email for detailed inquiries",
  },
};

export const SupportWidget = function ({ storageKey }: Props) {
  const open = useSupportSheet((state) => state.open);
  const onOpenChange = useSupportSheet((state) => state.setOpen);
  const [panel, setPanel] = useState<Panel>("menu");

  const { profile } = useGetProfile();

  // Reopening lands on the menu rather than wherever it was left.
  const handleOpenChange = (next: boolean) => {
    if (!next) setPanel("menu");
    onOpenChange(next);
  };

  return (
    <FloatingLauncher
      isOpen={open}
      onOpenChange={handleOpenChange}
      storageKey={storageKey}
      fit={panel !== "chat"}
      title={HEADINGS[panel].title}
      description={HEADINGS[panel].description}
      bodyClassName={panel === "menu" ? undefined : "flex flex-col p-0"}
      headerLeading={
        panel === "menu" ? undefined : (
          <button
            type="button"
            onClick={() => setPanel("menu")}
            aria-label="Back to support options"
            className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )
      }
    >
      {panel === "menu" && (
        <div className="space-y-3">
          {OPTIONS.map((option) => (
            <button
              key={option.panel}
              type="button"
              onClick={() => setPanel(option.panel)}
              className="bg-brand-soft hover:bg-brand-soft/70 flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl p-4 text-left transition-colors"
            >
              <div>
                <AppText
                  type="label"
                  className="text-brand block font-semibold"
                >
                  {option.title}
                </AppText>
                <AppText type="caption" className="text-brand/80 block">
                  {option.description}
                </AppText>
              </div>
              <ChevronRight className="text-brand h-5 w-5 shrink-0" />
            </button>
          ))}
        </div>
      )}

      {panel === "chat" && <LiveChatPanel firstName={profile?.first_name} />}
      {panel === "report" && (
        <ReportIssuePanel onDone={() => handleOpenChange(false)} />
      )}
      {panel === "contact" && (
        <ContactPanel onDone={() => handleOpenChange(false)} />
      )}
    </FloatingLauncher>
  );
};
