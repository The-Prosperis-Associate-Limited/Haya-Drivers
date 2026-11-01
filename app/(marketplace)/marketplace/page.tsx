"use client";

import { DriverCard } from "@/components/drivers/driver-card";
import { DriverProfileDialog } from "@/components/drivers/driver-profile-dialog";
import { AppSimpleSelect } from "@/components/shared/app-simple-select";
import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, SearchX } from "lucide-react";
import Image from "next/image";
import { State } from "country-state-city";
import { useMemo, useState } from "react";
import { SearchPanel } from "@/components/drivers/search-panel";
import { useDriverSearch } from "@/hooks/use-driver-search";

const PAGE_SIZE = 6;

export default function Marketplace() {
  const [state, setState] = useState("Lagos");
  const [page, setPage] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  const states = useMemo(
    () =>
      State.getStatesOfCountry("NG").map((entry) => ({
        value: entry.name,
        label: `${entry.name} Nigeria`,
      })),
    [],
  );

  const { drivers, totalPages, isFetching } = useDriverSearch({
    state,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 md:px-8">
      {/* No overflow-hidden: the search panel's dropdowns open past the hero's bottom edge. */}
      <section className="bg-brand relative rounded-3xl">
        <Image
          src="/cloud-top-left.svg"
          alt=""
          width={300}
          height={103}
          className="pointer-events-none absolute top-10 left-8 hidden w-44 opacity-90 lg:block"
        />
        <Image
          src="/cloud-top-right.svg"
          alt=""
          width={283}
          height={103}
          className="pointer-events-none absolute top-14 right-8 hidden w-40 opacity-90 lg:block"
        />
        <Image
          src="/cloud-bottom-left.svg"
          alt=""
          width={145}
          height={88}
          className="pointer-events-none absolute bottom-2 left-10 hidden w-28 opacity-90 lg:block"
        />
        <Image
          src="/cloud-bottom-right.svg"
          alt=""
          width={217}
          height={85}
          className="pointer-events-none absolute right-10 bottom-2 hidden w-32 opacity-90 lg:block"
        />

        <div className="relative z-10 px-5 pt-14 pb-10 md:px-12 md:pt-20">
          <div className="mx-auto max-w-2xl text-center">
            <AppText
              type="h1"
              className="text-4xl font-bold text-white md:text-5xl"
            >
              Welcome to Haya Drivers
            </AppText>
            <AppText type="subtitle" className="mt-4 block text-white/85">
              "Stop calling around and waiting for callbacks. Connect instantly
              with skilled, verified drivers near you."
            </AppText>
          </div>

          <SearchPanel className="mt-10 shadow-lg" />
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <AppText
              type="h2"
              className="text-lg font-semibold tracking-tight md:text-[22px]"
            >
              See drivers in
            </AppText>
            <AppSimpleSelect
              options={states}
              value={state}
              onValueChange={(value) => {
                setState(value);
                setPage(1);
              }}
              className="text-brand w-auto border-none font-semibold underline underline-offset-4"
            />
          </span>

          <span className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous page"
              className="rounded-full"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next page"
              className="rounded-full"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </span>
        </div>

        {isFetching && !drivers.length ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <Skeleton key={index} className="h-[210px] rounded-2xl" />
            ))}
          </div>
        ) : drivers.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={`No verified drivers in ${state} yet`}
            description="Try another state, or check back soon - new drivers are verified every week."
            className="mt-10"
          />
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {drivers.map((driver) => (
              <DriverCard
                key={driver.id}
                driver={driver}
                onRequest={(entry) => setSelectedDriver(entry.userId)}
              />
            ))}
          </div>
        )}
      </section>

      <DriverProfileDialog
        driverUserId={selectedDriver}
        onOpenChange={(open) => !open && setSelectedDriver(null)}
      />
    </div>
  );
}
