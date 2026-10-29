"use client";

import { ReactNode, useMemo } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { AppText } from "./app-text";
import { AppInput } from "./app-input";
import { AppSimpleSelect } from "./app-simple-select";
import { cn } from "@/lib/utils";

interface PaginationProps {
  children: ReactNode;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  total?: number;
  isLoading?: boolean;
  limitOptions?: number[];
  /** how many numbered page buttons to show at once (excluding ellipses) */
  siblingCount?: number;
  /** pass these to opt into rendering a search input above the content */
  search?: string;
  onSearchChange?: (search: string) => void;
  searchPlaceholder?: string;
  className?: string;
  controlsClassName?: string;
}

type PageItem = number | "ellipsis-start" | "ellipsis-end";

function getPageItems(
  page: number,
  totalPages: number,
  siblingCount: number,
): PageItem[] {
  // total numbers we'd show if there were no truncation: siblings on each
  // side + current + first + last
  const totalNumbersShown = siblingCount * 2 + 5;

  if (totalPages <= totalNumbersShown) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, totalPages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  const items: PageItem[] = [1];

  if (showLeftEllipsis) {
    items.push("ellipsis-start");
  } else if (leftSibling > 1) {
    for (let i = 2; i < leftSibling; i++) items.push(i);
  }

  for (
    let i = Math.max(leftSibling, 2);
    i <= Math.min(rightSibling, totalPages - 1);
    i++
  ) {
    items.push(i);
  }

  if (showRightEllipsis) {
    items.push("ellipsis-end");
  } else if (rightSibling < totalPages) {
    for (let i = rightSibling + 1; i < totalPages; i++) items.push(i);
  }

  items.push(totalPages);

  return items;
}

export function Pagination({
  children,
  page,
  totalPages,
  onPageChange,
  limit = 10,
  onLimitChange,
  total,
  isLoading = false,
  limitOptions = [10, 25, 50, 100],
  siblingCount = 1,
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  className,
  controlsClassName,
}: PaginationProps) {
  const showSearch = onSearchChange !== undefined;
  const canGoPrevious = page > 1 && !isLoading;
  const canGoNext = page < totalPages && !isLoading;

  const pageItems = useMemo(
    () => getPageItems(page, Math.max(totalPages, 1), siblingCount),
    [page, totalPages, siblingCount],
  );

  return (
    <div className={className}>
      {/* search - only rendered when the consumer opts in via onSearchChange */}
      {showSearch ? (
        <div className="my-4 ml-auto max-w-sm">
          <AppInput
            type="search"
            value={search ?? ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>
      ) : null}

      {/* content */}
      {children}

      {/* pagination footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className={cn(
          "flex flex-wrap items-center justify-between gap-4 py-4",
          controlsClassName,
        )}
      >
        <div className="flex items-center gap-2">
          {onLimitChange ? (
            <>
              <AppText
                type="caption"
                className="text-muted-foreground shrink-0 text-sm"
              >
                Rows per page
              </AppText>
              <AppSimpleSelect
                value={String(limit)}
                options={limitOptions.map((opt) => ({
                  label: String(opt),
                  value: String(opt),
                }))}
                onValueChange={(val) => onLimitChange(Number(val))}
                containerClassName="w-24 h-8"
              />
            </>
          ) : null}

          {typeof total === "number" ? (
            <AppText
              type="caption"
              className="text-muted-foreground shrink-0 text-sm"
            >
              {total} total
            </AppText>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(page - 1)}
            disabled={!canGoPrevious}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>

          {pageItems.map((item, idx) =>
            typeof item === "number" ? (
              <Button
                key={item}
                variant="outline"
                size="icon"
                className={cn(
                  "size-8 font-medium",
                  item === page &&
                    "bg-brand border-brand hover:bg-brand text-white hover:text-white",
                )}
                onClick={() => onPageChange(item)}
                disabled={isLoading}
                aria-current={item === page ? "page" : undefined}
                aria-label={`Go to page ${item}`}
              >
                {item}
              </Button>
            ) : (
              <span
                key={item + idx}
                className="text-muted-foreground flex size-8 items-center justify-center text-sm select-none"
              >
                &#8230;
              </span>
            ),
          )}

          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(page + 1)}
            disabled={!canGoNext}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
