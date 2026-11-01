"use client";

import { useMemo, useState } from "react";
import {
  Controller,
  get,
  type Control,
  type FieldErrors,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Dial codes ordered longest-first so parsing "+2348..." matches +234, not +2.
const COUNTRY_CODES = [
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+233", country: "Ghana", flag: "🇬🇭" },
  { code: "+229", country: "Benin", flag: "🇧🇯" },
  { code: "+228", country: "Togo", flag: "🇹🇬" },
  { code: "+237", country: "Cameroon", flag: "🇨🇲" },
  { code: "+227", country: "Niger", flag: "🇳🇪" },
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+1", country: "US / Canada", flag: "🇺🇸" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+91", country: "India", flag: "🇮🇳" },
];

const parseValue = function (value: string) {
  const match = [...COUNTRY_CODES]
    .sort((a, b) => b.code.length - a.code.length)
    .find((entry) => value.startsWith(entry.code));

  if (!match) return { code: "+234", local: value.replace(/^\+/, "") };

  return { code: match.code, local: value.slice(match.code.length) };
};

interface Props<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  errors?: FieldErrors<TFieldValues>;
  label?: string;
  placeholder?: string;
  containerClassName?: string;
}

export function FormPhoneInput<TFieldValues extends FieldValues>({
  control,
  name,
  errors,
  label = "Phone number",
  placeholder = "E.g 8012345678",
  containerClassName,
}: Props<TFieldValues>) {
  const errorMessage = get(errors, name)?.message as string | undefined;
  const inputId = `${String(name)}-phone`;
  const [focused, setFocused] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const { code, local } = parseValue((field.value as string) ?? "");

        const commit = (nextCode: string, nextLocal: string) => {
          // A leading 0 is the local prefix (0801...) - E.164 drops it.
          const cleaned = nextLocal.replace(/\D/g, "").replace(/^0+/, "");
          field.onChange(cleaned ? `${nextCode}${cleaned}` : "");
        };

        return (
          <div className={cn("flex flex-col gap-1.5", containerClassName)}>
            {label && <Label htmlFor={inputId}>{label}</Label>}

            <div
              className={cn(
                "border-input bg-background flex h-11 items-center rounded-md border shadow-xs transition-[color,box-shadow]",
                focused && "border-ring ring-ring/50 ring-3",
                errorMessage &&
                  "border-destructive " +
                    (focused ? "ring-destructive/20" : ""),
              )}
            >
              <select
                aria-label="Country code"
                value={code}
                onChange={(e) => commit(e.target.value, local)}
                className="text-foreground border-input h-full cursor-pointer rounded-l-md border-r bg-transparent pr-1 pl-3 text-sm outline-none"
              >
                {COUNTRY_CODES.map((entry) => (
                  <option key={entry.code} value={entry.code}>
                    {entry.flag} {entry.code}
                  </option>
                ))}
              </select>

              <input
                id={inputId}
                type="tel"
                inputMode="numeric"
                value={local}
                onChange={(e) => commit(code, e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => {
                  setFocused(false);
                  field.onBlur();
                }}
                placeholder={placeholder}
                aria-invalid={!!errorMessage}
                autoComplete="tel-national"
                className="placeholder:text-muted-foreground h-full flex-1 bg-transparent px-3 text-sm outline-none"
              />
            </div>

            {errorMessage && (
              <p className="text-destructive text-xs">{errorMessage}</p>
            )}
          </div>
        );
      }}
    />
  );
}
