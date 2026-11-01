"use client";

import { ChevronDown, X, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RemoveScroll } from "react-remove-scroll";

export interface SelectOption {
  label: string;
  value: string;
  description?: string;
}

interface Props {
  label?: string;
  options: SelectOption[];
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  containerClassName?: string;
}

export const AppSelect = function ({
  label,
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  error,
  disabled,
  containerClassName,
}: Props) {
  const inputId = label?.toLowerCase().replace(/\s+/g, "-");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const selectedOption = options.find((o) => o.value === value) ?? null;

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  // Close on outside click - the list is portalled, so check both nodes.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        !containerRef.current?.contains(e.target as Node) &&
        !listRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Portalled at a fixed position so overflow containers can't clip it; capture-phase scroll re-measures on any ancestor scroll.
  useEffect(() => {
    if (!open) return;

    const measure = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setPosition({
          top: rect.bottom + 6,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open]);

  const handleOpen = () => {
    if (disabled) return;
    // Re-clicking while open must not wipe a half-typed search.
    if (!open) {
      setOpen(true);
      setSearch("");
    }
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (option: SelectOption) => {
    onValueChange?.(option.value);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange?.(null);
    setSearch("");
  };

  const displayValue = open ? search : (selectedOption?.label ?? "");

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && <Label htmlFor={inputId}>{label}</Label>}

      <div ref={containerRef} className="relative">
        {/* Input row */}
        <div
          className={cn(
            "border-input bg-background flex h-11 items-center rounded-md border px-3 shadow-xs transition-[color,box-shadow]",
            "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-3",
            error && "border-destructive focus-within:ring-destructive/20",
            disabled && "cursor-not-allowed opacity-50",
          )}
          onClick={handleOpen}
        >
          <input
            ref={inputRef}
            id={inputId}
            value={displayValue}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!open) setOpen(true);
            }}
            placeholder={!open && !selectedOption ? placeholder : ""}
            disabled={disabled}
            aria-invalid={!!error}
            autoComplete="off"
            className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none disabled:cursor-not-allowed"
          />

          <div className="flex items-center gap-0.5">
            {selectedOption && !disabled && (
              <Button
                variant="ghost"
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground flex size-5 items-center justify-center rounded-sm"
              >
                <X className="size-3.5" />
              </Button>
            )}
            <ChevronDown
              className={cn(
                "text-muted-foreground size-4 transition-transform duration-150",
                open && "rotate-180",
              )}
            />
          </div>
        </div>

        {/* pointer-events-auto and stopPropagation get past a modal dialog's pointer lock and outside-dismiss; RemoveScroll joins its scroll lock. */}
        {open &&
          createPortal(
            // listRef rides on RemoveScroll: forwardProps replaces the child's ref, and a dead ref makes every click "outside".
            <RemoveScroll ref={listRef} forwardProps removeScrollBar={false}>
              <div
                onPointerDown={(e) => e.stopPropagation()}
                style={{
                  top: position.top,
                  left: position.left,
                  width: position.width,
                }}
                className="border-foreground/10 bg-popover text-popover-foreground pointer-events-auto fixed z-[60] rounded-md border shadow-md"
              >
                <ul className="no-scrollbar max-h-72 overflow-y-auto overscroll-contain p-1">
                  {filtered.length === 0 ? (
                    <li className="text-muted-foreground py-2 text-center text-sm">
                      No options found.
                    </li>
                  ) : (
                    filtered.map((option) => (
                      <li
                        key={option.value}
                        // Select on click, not mousedown: unmounting on mousedown let the click open the input underneath.
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelect(option)}
                        className={cn(
                          "relative flex cursor-pointer flex-col rounded-sm py-1.5 pr-8 pl-2 text-sm select-none",
                          "hover:bg-accent hover:text-accent-foreground",
                          option.value === value &&
                            "bg-accent/50 text-accent-foreground",
                        )}
                      >
                        {option.label}
                        {option.description && (
                          <span className="text-muted-foreground text-xs">
                            {option.description}
                          </span>
                        )}
                        {option.value === value && (
                          <span className="absolute right-2 flex size-4 items-center justify-center">
                            <Check className="size-3.5" />
                          </span>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </RemoveScroll>,
            document.body,
          )}
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
};
