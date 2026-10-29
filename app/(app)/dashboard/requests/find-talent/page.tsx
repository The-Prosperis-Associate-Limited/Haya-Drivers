"use client";

import {
  SearchPanel,
  type SearchFilters,
} from "@/components/drivers/search-panel";
import { TalentCard } from "@/components/drivers/talent-card";
import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchX } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useDriverSearch } from "@/hooks/use-driver-search";
import { useGetProfile } from "@/hooks/use-get-profile";

const PAGE_SIZE = 6;

export default function FindTalent() {
  const { profile } = useGetProfile();
  const savedBudget = profile?.client_profile?.monthly_budget;
  const defaults: SearchFilters = savedBudget
    ? { budget: String(savedBudget / 100) }
    : {};

  const [filters, setFilters] = useState<SearchFilters | null>(null);
  const [page, setPage] = useState(1);

  const { drivers, total, totalPages, isFetching } = useDriverSearch({
    ...(filters ?? defaults),
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="mx-auto max-w-[1360px]">
      <AppText
        type="h2"
        className="mt-3 text-[22px] font-semibold tracking-tight"
      >
        Find verified talent
      </AppText>
      <AppText type="subtitle" className="text-muted-foreground mt-1 text-sm">
        Every profile below has passed Haya Drivers identity, licence and
        guarantor checks. Filter by role, city and budget.
      </AppText>

      <SearchPanel
        key={savedBudget ?? "none"}
        defaults={defaults}
        className="border-border mt-5 border shadow-sm"
        onSearch={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      <div className="bg-brand-soft/60 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4">
        <div>
          <AppText type="label" className="text-sm font-semibold">
            Can't decide? Let us match you
          </AppText>
          <AppText
            type="caption"
            className="text-muted-foreground block text-xs"
          >
            Tell us what you need and our team picks a vetted driver for you.
          </AppText>
        </div>
        <Button
          asChild
          variant="outline"
          className="h-9 rounded-lg px-4 text-xs"
        >
          <Link href="/dashboard/my-hire/request">Request a driver</Link>
        </Button>
      </div>

      <AppText type="caption" className="text-muted-foreground mt-6 block">
        {total} {total === 1 ? "profile matches" : "profiles match"} your
        filters
      </AppText>

      {isFetching && !drivers.length ? (
        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[230px] rounded-2xl" />
          ))}
        </div>
      ) : drivers.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No profiles match your filters"
          description="Loosen a filter or two - or check back soon, new drivers are verified every week."
          className="mt-10"
        />
      ) : (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
          isLoading={isFetching}
          className="mt-4"
        >
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {drivers.map((driver) => (
              <TalentCard key={driver.id} driver={driver} />
            ))}
          </div>
        </Pagination>
      )}
    </div>
  );
}
