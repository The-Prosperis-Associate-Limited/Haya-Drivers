"use client";

import { AppInput } from "@/components/shared/app-input";
import { AppText } from "@/components/shared/app-text";
import { AppTextArea } from "@/components/shared/app-textarea";
import { Button } from "@/components/ui/button";
import { useCreateTicket } from "@/hooks/use-tickets";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

interface Props {
  onDone: () => void;
}

const SUPPORT_EMAIL = "hayadrivers@prosperisassociates.com";
const SUPPORT_LINE = "+234 700 8342 800";
const HEAD_OFFICE = "14 Admiralty Way, Lekki, Lagos";

const MAX_MESSAGE = 1000;

export const ContactPanel = function ({ onDone }: Props) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const { createTicket, isPending } = useCreateTicket({
    onSuccessMessage: "Message sent, we'll be in touch",
    onSuccess: onDone,
  });

  const canSubmit = subject.trim().length >= 3 && message.trim().length >= 10;

  const details = [
    {
      icon: Mail,
      label: "Email us",
      value: SUPPORT_EMAIL,
      href: `mailto:${SUPPORT_EMAIL}`,
    },
    {
      icon: Phone,
      label: "Call us",
      value: SUPPORT_LINE,
      href: `tel:${SUPPORT_LINE.replace(/\s/g, "")}`,
    },
    { icon: MapPin, label: "Head office", value: HEAD_OFFICE, href: null },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {details.map((detail) => {
          const Icon = detail.icon;

          const body = (
            <>
              <span className="bg-brand-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <Icon className="text-brand h-5 w-5" />
              </span>

              <span className="min-w-0">
                <AppText
                  type="caption"
                  className="text-muted-foreground block font-semibold tracking-wide uppercase"
                >
                  {detail.label}
                </AppText>
                <AppText type="label" className="block truncate">
                  {detail.value}
                </AppText>
              </span>
            </>
          );

          return detail.href ? (
            <a
              key={detail.label}
              href={detail.href}
              className="border-border hover:border-brand/40 flex items-center gap-3 rounded-xl border p-3 transition-colors"
            >
              {body}
            </a>
          ) : (
            <div
              key={detail.label}
              className="border-border flex items-center gap-3 rounded-xl border p-3"
            >
              {body}
            </div>
          );
        })}

        <div className="flex items-center gap-3">
          <span className="border-border flex-1 border-t" />
          <AppText
            type="caption"
            className="text-muted-foreground tracking-wide uppercase"
          >
            Or send a message
          </AppText>
          <span className="border-border flex-1 border-t" />
        </div>

        <AppInput
          label="Subject"
          placeholder="What is this about?"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <AppText type="label">Message</AppText>
            <AppText type="caption" className="text-muted-foreground">
              {message.length}/{MAX_MESSAGE}
            </AppText>
          </div>

          <AppTextArea
            placeholder="Write your inquiry in detail..."
            rows={8}
            maxLength={MAX_MESSAGE}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>
      </div>

      <div className="border-border border-t p-5">
        <Button
          onClick={() =>
            createTicket({
              subject: subject.trim(),
              description: message.trim(),
              category: "OTHER",
            })
          }
          disabled={!canSubmit}
          isLoading={isPending}
          className="h-12 w-full rounded-lg"
        >
          Send message
        </Button>
      </div>
    </div>
  );
};
