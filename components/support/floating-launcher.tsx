"use client";

import { cn } from "@/lib/utils";
import { Headset, X } from "lucide-react";
import { useIsClient } from "@/hooks/use-is-client";
import { useEffect, useRef, useState } from "react";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  headerLeading?: React.ReactNode;
  bodyClassName?: string;
  children: React.ReactNode;
  // Where this surface remembers the button's position, so the client and driver apps keep their own.
  storageKey: string;
  label?: string;
  // Menus and forms size to their content; a chat thread needs the full height to pin its composer.
  fit?: boolean;
}

const BUTTON = 56;
const EDGE = 16;
const GAP = 12;
const DRAG_THRESHOLD = 5;

type Position = { x: number; y: number };

const clamp = (position: Position): Position => ({
  x: Math.min(Math.max(EDGE, position.x), window.innerWidth - BUTTON - EDGE),
  y: Math.min(Math.max(EDGE, position.y), window.innerHeight - BUTTON - EDGE),
});

const defaultPosition = (): Position => ({
  x: window.innerWidth - BUTTON - 24,
  y: window.innerHeight - BUTTON - 24,
});

const readPosition = (key: string): Position | null => {
  try {
    const stored = JSON.parse(localStorage.getItem(key) ?? "null");
    return typeof stored?.x === "number" && typeof stored?.y === "number"
      ? stored
      : null;
  } catch {
    return null;
  }
};

const writePosition = (key: string, position: Position) => {
  try {
    localStorage.setItem(key, JSON.stringify(position));
  } catch {}
};

export const FloatingLauncher = function ({
  isOpen,
  onOpenChange,
  title,
  description,
  headerLeading,
  bodyClassName,
  children,
  storageKey,
  label = "Support",
  fit = false,
}: Props) {
  const isClient = useIsClient();
  const [dragged, setDragged] = useState<Position | null>(null);
  const [, setViewport] = useState({ width: 0, height: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{
    pointerX: number;
    pointerY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  // The viewport only exists in the browser, so the button renders after hydration and re-clamps on every render.
  const position = isClient
    ? clamp(dragged ?? readPosition(storageKey) ?? defaultPosition())
    : null;

  // Resizing re-renders, which re-clamps the button inside the new viewport.
  useEffect(() => {
    const onResize = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onOpenChange]);

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!position || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: position.x,
      startY: position.y,
      moved: false,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const state = drag.current;
    if (!state) return;

    const dx = event.clientX - state.pointerX;
    const dy = event.clientY - state.pointerY;

    if (!state.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    state.moved = true;
    setDragging(true);
    setDragged(clamp({ x: state.startX + dx, y: state.startY + dy }));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const state = drag.current;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!state) return;

    if (state.moved) {
      setDragging(false);
      if (position) writePosition(storageKey, position);
      return;
    }

    onOpenChange(!isOpen);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpenChange(!isOpen);
    }
  };

  if (!position) return null;

  // The panel opens toward the middle of the screen, on whichever side of the button has more room, so it never covers it.
  const panelStyle = (() => {
    const width = Math.min(400, window.innerWidth - EDGE * 2);
    const roomAbove = position.y - GAP - EDGE;
    const roomBelow = window.innerHeight - position.y - BUTTON - GAP - EDGE;
    const onBottom = roomAbove > roomBelow;
    const maxHeight = Math.min(
      600,
      Math.max(320, onBottom ? roomAbove : roomBelow),
    );
    const onRight = position.x + BUTTON / 2 > window.innerWidth / 2;
    const left = onRight ? position.x + BUTTON - width : position.x;

    return {
      width,
      maxHeight,
      height: fit ? undefined : maxHeight,
      left: Math.min(Math.max(EDGE, left), window.innerWidth - width - EDGE),
      ...(onBottom
        ? {
            bottom: Math.max(EDGE, window.innerHeight - position.y + GAP),
          }
        : { top: Math.max(EDGE, position.y + BUTTON + GAP) }),
      transformOrigin: `${onRight ? "right" : "left"} ${onBottom ? "bottom" : "top"}`,
    };
  })();

  return (
    <>
      {isOpen && (
        <div
          role="dialog"
          aria-label={title}
          className="border-border animate-in fade-in-0 zoom-in-95 fixed z-50 flex flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_24px_60px_-16px_rgba(15,23,42,0.35)] duration-150 print:hidden"
          style={panelStyle}
        >
          <div className="border-border flex items-center gap-3 border-b px-5 py-3.5">
            {headerLeading}
            <div className="min-w-0 flex-1">
              <p className="text-ink truncate text-[15px] font-semibold">
                {title}
              </p>
              {description && (
                <p className="text-muted-foreground truncate text-xs">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="text-muted-foreground hover:text-foreground grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg transition-colors hover:bg-slate-100"
            >
              <X className="size-4" />
            </button>
          </div>
          <div
            className={cn("min-h-0 flex-1 overflow-y-auto px-5 py-4", bodyClassName)}
          >
            {children}
          </div>
        </div>
      )}

      <button
        type="button"
        aria-label={isOpen ? `Close ${label.toLowerCase()}` : label}
        aria-expanded={isOpen}
        title={`${label} - drag to move`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className={cn(
          "bg-brand fixed z-50 grid touch-none place-items-center rounded-full text-white shadow-[0_12px_28px_-8px_rgba(47,107,246,0.65)] transition-[transform,box-shadow] select-none print:hidden",
          dragging
            ? "scale-105 cursor-grabbing shadow-[0_18px_36px_-10px_rgba(47,107,246,0.75)]"
            : "cursor-grab hover:scale-105",
        )}
        style={{
          left: position.x,
          top: position.y,
          width: BUTTON,
          height: BUTTON,
        }}
      >
        {isOpen ? <X className="size-6" /> : <Headset className="size-6" />}
      </button>
    </>
  );
};
