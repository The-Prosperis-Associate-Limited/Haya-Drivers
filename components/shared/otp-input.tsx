"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: string;
}

export const OtpInput = function ({
  value,
  onChange,
  length = 6,
  disabled,
  error,
}: Props) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (index: number, digit: string) => {
    const next = value.padEnd(length, " ").split("");
    next[index] = digit || " ";
    onChange(next.join("").replace(/\s/g, " ").trimEnd());
  };

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return setDigit(index, "");

    if (digits.length > 1) {
      const next = value.split("");
      digits.split("").forEach((digit, offset) => {
        if (index + offset < length) next[index + offset] = digit;
      });
      onChange(next.join("").slice(0, length));
      inputs.current[Math.min(index + digits.length, length - 1)]?.focus();
      return;
    }

    setDigit(index, digits);
    if (index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0)
      inputs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 sm:gap-3">
        {Array.from({ length }).map((_, index) => (
          <div key={index} className="flex items-center gap-2 sm:gap-3">
            <input
              ref={(element) => {
                inputs.current[index] = element;
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={length}
              disabled={disabled}
              value={value[index]?.trim() ?? ""}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              aria-label={`Digit ${index + 1}`}
              className={cn(
                "border-input h-12 w-11 rounded-lg border bg-gray-50 text-center text-lg font-semibold sm:h-14 sm:w-13",
                "focus:border-brand focus:ring-brand/20 focus:ring-2 focus:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50",
                error && "border-destructive",
              )}
            />
            {index === Math.floor(length / 2) - 1 && (
              <span className="bg-border h-px w-3 shrink-0" />
            )}
          </div>
        ))}
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
};
