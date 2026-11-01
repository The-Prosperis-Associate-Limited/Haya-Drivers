"use client";

import { useRef, useState } from "react";
import {
  Controller,
  get,
  type Control,
  type FieldErrors,
  type FieldValues,
  type Path,
} from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface Props<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  errors?: FieldErrors<TFieldValues>;
  label?: string;
  containerClassName?: string;
}

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const PERIODS = ["AM", "PM"] as const;

type Period = (typeof PERIODS)[number];

interface Parts {
  hour: number | null;
  minute: number | null;
  period: Period | null;
}

// The field stores "HH:mm" (24h), same shape the native time input produced.
const partsFromValue = (value: string | undefined): Parts => {
  const match = /^(\d{2}):(\d{2})$/.exec(value ?? "");
  if (!match) return { hour: null, minute: null, period: null };
  const h24 = Number(match[1]);
  return {
    hour: h24 % 12 === 0 ? 12 : h24 % 12,
    minute: Number(match[2]),
    period: h24 < 12 ? "AM" : "PM",
  };
};

const valueFromParts = ({ hour, minute, period }: Parts): string => {
  if (hour === null || minute === null || period === null) return "";
  const h24 = (hour % 12) + (period === "PM" ? 12 : 0);
  return `${String(h24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

export const displayTime = (value: string | undefined): string => {
  const { hour, minute, period } = partsFromValue(value);
  if (hour === null) return "";
  return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
};

export function FormTimePicker<TFieldValues extends FieldValues>({
  control,
  name,
  errors,
  label,
  containerClassName,
}: Props<TFieldValues>) {
  const errorMessage = get(errors, name)?.message as string | undefined;
  const [open, setOpen] = useState(false);
  const picked = useRef({ hour: false, minute: false, period: false });

  const inputId = label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const parts = partsFromValue(field.value as string | undefined);

        const pick = (update: Partial<Parts>, column: keyof Parts) => {
          const next: Parts = { ...parts, ...update };
          field.onChange(
            valueFromParts({
              hour: next.hour ?? 12,
              minute: next.minute ?? 0,
              period: next.period ?? "AM",
            }),
          );
          picked.current[column] = true;
          const { hour, minute, period } = picked.current;
          if (hour && minute && period) setOpen(false);
        };

        const handleOpenChange = (next: boolean) => {
          if (next)
            picked.current = { hour: false, minute: false, period: false };
          setOpen(next);
        };

        return (
          <div
            className={cn("flex w-full flex-col gap-1.5", containerClassName)}
          >
            {label && <Label htmlFor={inputId}>{label}</Label>}
            <Popover open={open} onOpenChange={handleOpenChange}>
              <PopoverTrigger asChild>
                <Button
                  id={inputId}
                  variant="outline"
                  className={cn(
                    "h-11.75 w-full justify-start px-3 font-normal",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  <Clock className="mr-2 h-4 w-4 shrink-0" />
                  {displayTime(field.value as string | undefined) ||
                    "Pick a time"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <div className="flex gap-2">
                  <TimeColumn
                    title="Hour"
                    options={HOURS.map((h) => ({ value: h, label: String(h) }))}
                    selected={parts.hour}
                    onPick={(value) => pick({ hour: value }, "hour")}
                  />
                  <TimeColumn
                    title="Min"
                    options={MINUTES.map((m) => ({
                      value: m,
                      label: String(m).padStart(2, "0"),
                    }))}
                    selected={parts.minute}
                    onPick={(value) => pick({ minute: value }, "minute")}
                  />
                  <TimeColumn
                    title="AM/PM"
                    options={PERIODS.map((p) => ({ value: p, label: p }))}
                    selected={parts.period}
                    onPick={(value) => pick({ period: value }, "period")}
                  />
                </div>
              </PopoverContent>
            </Popover>
            {errorMessage && (
              <p className="text-destructive text-xs">{errorMessage}</p>
            )}
          </div>
        );
      }}
    />
  );
}

interface ColumnProps<T extends number | string> {
  title: string;
  options: { value: T; label: string }[];
  selected: T | null;
  onPick: (value: T) => void;
}

function TimeColumn<T extends number | string>({
  title,
  options,
  selected,
  onPick,
}: ColumnProps<T>) {
  return (
    <div className="flex flex-col">
      <span className="text-muted-foreground pb-1.5 text-center text-[10px] font-semibold tracking-wide uppercase">
        {title}
      </span>
      <div className="no-scrollbar flex max-h-52 w-14 flex-col gap-0.5 overflow-y-auto">
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onPick(option.value)}
            className={cn(
              "cursor-pointer rounded-md px-2 py-1.5 text-center text-sm transition-colors",
              option.value === selected
                ? "bg-brand text-white"
                : "hover:bg-muted",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
