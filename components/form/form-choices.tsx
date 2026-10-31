"use client";

import { Check, Minus, Plus, type LucideIcon } from "lucide-react";
import { Controller, get, type Control, type FieldErrors, type FieldValues, type Path } from "react-hook-form";
import { cn } from "@/lib/utils";

export interface ChoiceOption {
  value: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

interface BaseProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  errors?: FieldErrors<T>;
  label?: React.ReactNode;
  options: ChoiceOption[];
  multiple?: boolean;
  className?: string;
}

const toggle = (current: unknown, value: string, multiple?: boolean) => {
  if (!multiple) return value;
  const list = Array.isArray(current) ? (current as string[]) : [];
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
};

const isOn = (current: unknown, value: string) => (Array.isArray(current) ? current.includes(value) : current === value);

const FieldShell = function ({ label, error, children, className }: { label?: React.ReactNode; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className="text-[13px] font-semibold text-slate-700">{label}</p>}
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
};

export function FormChoiceChips<T extends FieldValues>({ control, name, errors, label, options, multiple, className }: BaseProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FieldShell label={label} error={get(errors, name)?.message} className={className}>
          <div className="flex flex-wrap gap-2" role={multiple ? "group" : "radiogroup"}>
            {options.map((option) => {
              const on = isOn(field.value, option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  role={multiple ? "checkbox" : "radio"}
                  aria-checked={on}
                  onClick={() => field.onChange(toggle(field.value, option.value, multiple))}
                  className={cn(
                    "border-border inline-flex items-center gap-2 rounded-xl border-[1.5px] bg-white px-3.5 py-2 text-[13px] font-medium text-slate-700 transition-colors",
                    on ? "border-brand bg-brand-soft text-brand font-semibold" : "hover:border-slate-300",
                  )}
                >
                  {option.label}
                  {option.description && <small className={cn("text-[11.5px] font-normal", on ? "text-brand/70" : "text-slate-400")}>{option.description}</small>}
                </button>
              );
            })}
          </div>
        </FieldShell>
      )}
    />
  );
}

export function FormOptionCards<T extends FieldValues>({ control, name, errors, label, options, multiple, className, columns = "sm:grid-cols-3" }: BaseProps<T> & { columns?: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FieldShell label={label} error={get(errors, name)?.message} className={className}>
          <div className={cn("grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2", columns)} role={multiple ? "group" : "radiogroup"}>
            {options.map((option) => {
              const on = isOn(field.value, option.value);
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  role={multiple ? "checkbox" : "radio"}
                  aria-checked={on}
                  onClick={() => field.onChange(toggle(field.value, option.value, multiple))}
                  className={cn(
                    "border-border relative grid gap-1 rounded-2xl border-[1.5px] bg-white p-4 text-left transition-all",
                    on ? "border-brand ring-brand-soft ring-4" : "hover:border-blue-200",
                  )}
                >
                  <span className={cn("absolute top-3 right-3 grid size-[22px] place-items-center rounded-full border-[1.5px]", on ? "border-brand bg-brand text-white" : "border-border text-transparent")}>
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {Icon && (
                    <span className={cn("mb-1.5 grid size-[38px] place-items-center rounded-xl", on ? "bg-brand text-white" : "bg-slate-100 text-slate-700")}>
                      <Icon className="size-5" />
                    </span>
                  )}
                  <span className="pr-6 text-sm font-semibold">{option.label}</span>
                  {option.description && <span className="text-muted-foreground text-[12.5px]">{option.description}</span>}
                </button>
              );
            })}
          </div>
        </FieldShell>
      )}
    />
  );
}

export function FormNumberStepper<T extends FieldValues>({
  control,
  name,
  errors,
  label,
  min = 0,
  max = 50,
  format,
}: Omit<BaseProps<T>, "options" | "multiple"> & { min?: number; max?: number; format: (value: number) => string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const raw = field.value === undefined || field.value === "" || field.value === null ? null : Number(field.value);
        const set = (next: number) => field.onChange(Math.min(max, Math.max(min, next)));
        return (
          <FieldShell label={label} error={get(errors, name)?.message}>
            <div className="border-border inline-flex items-center overflow-hidden rounded-xl border bg-white">
              <button type="button" aria-label="Fewer" onClick={() => set((raw ?? min) - 1)} className="grid size-11 place-items-center bg-slate-50 text-slate-700 hover:bg-slate-100">
                <Minus className="size-4" />
              </button>
              <span className={cn("min-w-[120px] px-2 text-center text-sm font-semibold", raw === null && "text-muted-foreground font-normal")} aria-live="polite">
                {raw === null ? "Select" : format(raw)}
              </span>
              <button type="button" aria-label="More" onClick={() => set(raw === null ? min : raw + 1)} className="grid size-11 place-items-center bg-slate-50 text-slate-700 hover:bg-slate-100">
                <Plus className="size-4" />
              </button>
            </div>
          </FieldShell>
        );
      }}
    />
  );
}
