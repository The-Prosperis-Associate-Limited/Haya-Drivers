"use client";

import { useState } from "react";
import {
  Controller,
  get,
  useWatch,
  type Control,
  type FieldErrors,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

// ─── Shared base props ────────────────────────────────────────────────────────

interface BaseProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  errors?: FieldErrors<TFieldValues>;
  label?: string;
  containerClassName?: string;
  /** Disable all dates strictly before this date */
  minDate?: Date;
  /** Disable all dates strictly after this date */
  maxDate?: Date;
  /** "dropdown" adds month/year selects - essential for dates decades away */
  captionLayout?: "label" | "dropdown";
}

// ─── Single-date mode ─────────────────────────────────────────────────────────

interface SingleProps<
  TFieldValues extends FieldValues,
> extends BaseProps<TFieldValues> {
  mode: "single";
  name: Path<TFieldValues>;
}

// ─── Range mode ───────────────────────────────────────────────────────────────

interface RangeProps<
  TFieldValues extends FieldValues,
> extends BaseProps<TFieldValues> {
  mode: "range";
  /** Field name for the start date (stored as ISO string) */
  startName: Path<TFieldValues>;
  /** Field name for the end date (stored as ISO string) */
  endName: Path<TFieldValues>;
}

type FormDatePickerProps<TFieldValues extends FieldValues> =
  SingleProps<TFieldValues> | RangeProps<TFieldValues>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
}

function buildDisabled(
  minDate?: Date,
  maxDate?: Date,
): ((date: Date) => boolean) | undefined {
  if (!minDate && !maxDate) return undefined;
  return (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FormDatePicker<TFieldValues extends FieldValues>(
  props: FormDatePickerProps<TFieldValues>,
) {
  if (props.mode === "range") {
    return <RangeDatePicker {...props} />;
  }
  return <SingleDatePicker {...props} />;
}

// ─── Single date picker ───────────────────────────────────────────────────────

function SingleDatePicker<TFieldValues extends FieldValues>({
  control,
  name,
  errors,
  label,
  containerClassName,
  minDate,
  maxDate,
  captionLayout,
}: SingleProps<TFieldValues>) {
  const errorMessage = get(errors, name)?.message as string | undefined;
  const disabled = buildDisabled(minDate, maxDate);
  const [open, setOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const selected = field.value
          ? new Date(field.value as string)
          : undefined;
        const inputId = label?.toLowerCase().replace(/\s+/g, "-");

        return (
          <div
            className={cn("flex w-full flex-col gap-1.5", containerClassName)}
          >
            {label && <Label htmlFor={inputId}>{label}</Label>}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  id={inputId}
                  variant="outline"
                  className={cn(
                    "h-11.75 w-full justify-start px-3 font-normal",
                    !selected && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  {selected ? selected.toLocaleDateString() : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" autoFocus>
                <Calendar
                  mode="single"
                  selected={selected}
                  onSelect={(date) => {
                    field.onChange(date ? date.toISOString() : "");
                    if (date) setOpen(false);
                  }}
                  disabled={disabled}
                  // With nothing selected it must open inside the navigable range or the grid renders empty.
                  defaultMonth={selected ?? minDate}
                  captionLayout={captionLayout}
                  startMonth={minDate}
                  endMonth={
                    maxDate ??
                    (minDate
                      ? new Date(
                          new Date(minDate).setFullYear(
                            minDate.getFullYear() + 30,
                          ),
                        )
                      : undefined)
                  }
                />
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

// ─── Range date picker ────────────────────────────────────────────────────────

function RangeDatePicker<TFieldValues extends FieldValues>({
  control,
  startName,
  endName,
  errors,
  label,
  containerClassName,
  minDate,
  maxDate,
}: RangeProps<TFieldValues>) {
  const startError = get(errors, startName)?.message as string | undefined;
  const endError = get(errors, endName)?.message as string | undefined;
  const errorMessage = startError ?? endError;

  // Watch both fields to build the display label
  const startValue = useWatch({ control, name: startName }) as
    string | undefined;
  const endValue = useWatch({ control, name: endName }) as string | undefined;

  const rangeLabel =
    startValue && endValue
      ? `${formatDate(startValue)} → ${formatDate(endValue)}`
      : startValue
        ? `${formatDate(startValue)} → …`
        : "Pick a date range";

  const disabled = buildDisabled(minDate, maxDate);
  const inputId = label?.toLowerCase().replace(/\s+/g, "-");
  const [open, setOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={startName}
      render={({ field: startField }) => (
        <Controller
          control={control}
          name={endName}
          render={({ field: endField }) => {
            const range: DateRange = {
              from: startField.value
                ? new Date(startField.value as string)
                : undefined,
              to: endField.value
                ? new Date(endField.value as string)
                : undefined,
            };

            const handleSelect = (selected: DateRange | undefined) => {
              startField.onChange(
                selected?.from ? selected.from.toISOString() : "",
              );
              endField.onChange(selected?.to ? selected.to.toISOString() : "");
              // A range is complete once both ends exist on distinct days.
              if (
                selected?.from &&
                selected?.to &&
                selected.from.getTime() !== selected.to.getTime()
              )
                setOpen(false);
            };

            return (
              <div
                className={cn(
                  "flex w-full flex-col gap-1.5",
                  containerClassName,
                )}
              >
                {label && <Label htmlFor={inputId}>{label}</Label>}
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id={inputId}
                      variant="outline"
                      className={cn(
                        "h-11.75 w-full justify-start px-3 font-normal",
                        !startField.value && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                      {rangeLabel}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
                    autoFocus
                  >
                    <Calendar
                      mode="range"
                      selected={range}
                      onSelect={handleSelect}
                      disabled={disabled}
                      defaultMonth={range.from}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                {errorMessage && (
                  <p className="text-destructive text-xs">{errorMessage}</p>
                )}
              </div>
            );
          }}
        />
      )}
    />
  );
}
