"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { AppInput } from "@/components/shared/app-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { useIsClient } from "@/hooks/use-is-client";
import { cn } from "@/lib/utils";
import { ArrowRight, CornerDownLeft, FileText, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { APIResponse } from "@/types/response";
import type { SearchGroup, SearchItem } from "@/types/search";

interface Page {
  label: string;
  href: string;
}

interface Props {
  placeholder: string;
  searchUrl: (q: string) => string;
  hrefPrefix?: string;
  pages: Page[];
  className?: string;
}

const MIN_QUERY = 2;

const initialsOf = (title: string) =>
  title
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export const GlobalSearch = function ({
  placeholder,
  searchUrl,
  hrefPrefix = "",
  pages,
  className,
}: Props) {
  const router = useRouter();
  const isClient = useIsClient();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const canSearch = debounced.length >= MIN_QUERY;

  const { data, isFetching } = useGetData<APIResponse<SearchGroup[]>>({
    url: searchUrl(debounced),
    shouldFetch: open && canSearch,
    staleTime: 30 * 1000,
  });

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matchingPages = pages
      .filter((page) => !needle || page.label.toLowerCase().includes(needle))
      .map<SearchItem>((page) => ({
        id: page.href,
        title: page.label,
        subtitle: "Go to page",
        href: page.href,
      }));

    const remote = canSearch
      ? (data?.data ?? []).map((group) => ({
          ...group,
          items: group.items.map((item) => ({
            ...item,
            href: `${hrefPrefix}${item.href}`,
          })),
        }))
      : [];

    return [
      ...remote,
      ...(matchingPages.length
        ? [{ key: "pages", label: "Pages", items: matchingPages }]
        : []),
    ];
  }, [canSearch, data, hrefPrefix, pages, query]);

  const flat = groups.flatMap((group) => group.items);
  const activeIndex = Math.min(active, Math.max(flat.length - 1, 0));

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setDebounced("");
    setActive(0);
  };

  const go = (item?: SearchItem) => {
    if (!item) return;
    close();
    router.push(item.href);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((activeIndex + 1) % Math.max(flat.length, 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(
        (activeIndex - 1 + Math.max(flat.length, 1)) % Math.max(flat.length, 1),
      );
    }
    if (event.key === "Enter") {
      event.preventDefault();
      go(flat[activeIndex]);
    }
  };

  const isMac = isClient && /Mac|iPhone|iPad/.test(navigator.userAgent);
  const loading = canSearch && isFetching && !data;
  const searching = query.trim().length >= MIN_QUERY;
  const noRemote = canSearch && !isFetching && !(data?.data ?? []).length;

  let index = -1;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "border-input text-muted-foreground hover:border-brand/40 flex h-10 w-full items-center gap-2.5 rounded-xl border bg-slate-50 px-3 text-left text-sm transition-colors",
          className,
        )}
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 truncate">{placeholder}</span>
        <kbd className="border-border hidden shrink-0 rounded-md border bg-white px-1.5 py-0.5 text-[10.5px] font-semibold text-slate-500 md:inline">
          {isMac ? "⌘ K" : "Ctrl K"}
        </kbd>
      </button>

      <AppDialog
        isOpen={open}
        onOpenChange={(next) => (next ? setOpen(true) : close())}
        title="Search"
        width="600px"
      >
        <div className="space-y-3 pb-2">
          <AppInput
            type="search"
            autoFocus
            value={query}
            placeholder={placeholder}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            className="h-11 rounded-xl"
            aria-label="Search"
          />

          {!searching && (
            <p className="text-muted-foreground px-1 text-xs">
              Type at least {MIN_QUERY} characters to search, or jump to a page.
            </p>
          )}

          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, row) => (
                <Skeleton key={row} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          )}

          {noRemote && (
            <p className="text-muted-foreground px-1 text-sm">
              No matches for &ldquo;{debounced}&rdquo;.
            </p>
          )}

          <div
            ref={listRef}
            className="space-y-3"
            role="listbox"
            aria-label="Results"
          >
            {groups.map((group) => (
              <div key={group.key}>
                <p className="px-1 pb-1 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  {group.label}
                </p>
                <ul>
                  {group.items.map((item) => {
                    index += 1;
                    const itemIndex = index;
                    const selected = itemIndex === activeIndex;

                    return (
                      <li key={`${group.key}-${item.id}`}>
                        <button
                          type="button"
                          role="option"
                          data-index={itemIndex}
                          aria-selected={selected}
                          onMouseEnter={() => setActive(itemIndex)}
                          onClick={() => go(item)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors",
                            selected && "bg-brand-soft",
                          )}
                        >
                          {!("avatar" in item) ? (
                            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                              {group.key === "pages" ? (
                                <ArrowRight className="size-4" />
                              ) : (
                                <FileText className="size-4" />
                              )}
                            </span>
                          ) : (
                            <Avatar className="size-8 shrink-0">
                              <AvatarImage
                                src={item.avatar ?? undefined}
                                alt=""
                              />
                              <AvatarFallback className="text-[10px]">
                                {initialsOf(item.title)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="text-ink block truncate text-[13.5px] font-semibold">
                              {item.title}
                            </span>
                            <span className="text-muted-foreground block truncate text-xs">
                              {item.subtitle}
                            </span>
                          </span>
                          {selected && (
                            <CornerDownLeft className="text-brand hidden size-4 shrink-0 md:block" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </AppDialog>
    </>
  );
};
