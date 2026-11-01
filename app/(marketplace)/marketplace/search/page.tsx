"use client";

import { DriverCard } from "@/components/drivers/driver-card";
import { DriverProfileDialog } from "@/components/drivers/driver-profile-dialog";
import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { driverTypeLabel } from "@/lib/utils";
import { State } from "country-state-city";
import { SearchX } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { SearchPanel } from "@/components/drivers/search-panel";
import { useDriverSearch } from "@/hooks/use-driver-search";

const PAGE_SIZE = 6;

// Leaflet reads window at import time, so the map can only load in the browser.
const ResultsMap = dynamic(
  () => import("./_components/results-map").then((mod) => mod.ResultsMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full min-h-[480px] rounded-2xl" />,
  },
);

const NIGERIA_CENTER: [number, number] = [9.082, 8.6753];

function SearchResults() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  const filters = {
    driver_type: searchParams.get("driver_type") ?? undefined,
    state: searchParams.get("state") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    budget: searchParams.get("budget") ?? undefined,
  };

  const { drivers, total, totalPages, isFetching } = useDriverSearch({
    ...filters,
    page,
    limit: PAGE_SIZE,
  });

  const center = useMemo<[number, number]>(() => {
    const state = State.getStatesOfCountry("NG").find(
      (entry) => entry.name === filters.state,
    );
    return state
      ? [Number(state.latitude), Number(state.longitude)]
      : NIGERIA_CENTER;
  }, [filters.state]);

  const crumbs = [
    { label: "Home", href: "/marketplace" },
    ...(filters.state ? [{ label: filters.state }] : []),
    ...(filters.city ? [{ label: filters.city }] : []),
    ...(filters.driver_type
      ? [{ label: driverTypeLabel(filters.driver_type) }]
      : []),
  ];

  const areaLabel = [filters.state ?? "Nigeria", filters.state && "Nigeria"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <nav className="text-muted-foreground flex flex-wrap items-center gap-1 text-sm">
        {crumbs.map((crumb, index) => (
          <span key={crumb.label} className="flex items-center gap-1">
            {index > 0 && <span>/</span>}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-brand underline underline-offset-2"
              >
                {crumb.label}
              </Link>
            ) : (
              <span>{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <AppText
        type="h2"
        className="mt-3 text-xl font-semibold tracking-tight md:text-[22px]"
      >
        Search results for drivers in {areaLabel}
      </AppText>

      <SearchPanel
        defaults={filters}
        className="border-border mt-4 border-b px-0 pb-6"
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
        <div>
          {isFetching && !drivers.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-[210px] rounded-2xl" />
              ))}
            </div>
          ) : drivers.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Ohh no, we couldn't find a driver that suits your need."
              description="Loosen a filter or two - or search a nearby state."
              className="py-24"
            />
          ) : (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              onPageChange={setPage}
              isLoading={isFetching}
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {drivers.map((driver) => (
                  <DriverCard
                    key={driver.id}
                    driver={driver}
                    onRequest={(entry) => setSelectedDriver(entry.userId)}
                  />
                ))}
              </div>
            </Pagination>
          )}
        </div>

        {/* Decorative below lg it would push the results off screen - drop it. */}
        <div className="hidden lg:block">
          <ResultsMap key={center.join(",")} center={center} />
        </div>
      </div>

      <DriverProfileDialog
        driverUserId={selectedDriver}
        onOpenChange={(open) => !open && setSelectedDriver(null)}
      />
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={null}>
      <SearchResults />
    </Suspense>
  );
}
