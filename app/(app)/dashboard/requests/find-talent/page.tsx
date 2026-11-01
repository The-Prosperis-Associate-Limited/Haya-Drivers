"use client";

import {
  SearchPanel,
  type SearchFilters,
} from "@/components/drivers/search-panel";
import { TalentCard } from "@/components/drivers/talent-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchX, ShieldCheck, Sparkles } from "lucide-react";
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
    <div className="mx-auto max-w-[1360px] space-y-5">
      <PageHeader
        title="Find verified drivers"
        subtitle="Every profile here has passed identity, licence and guarantor checks. Filter by role, area and budget."
      />

      <SearchPanel
        key={savedBudget ?? "none"}
        defaults={defaults}
        className="border-border border p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5"
        onSearch={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-900 px-4 py-3.5 text-white md:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10">
            <Sparkles className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">
              Can&apos;t decide? Let us match you
            </p>
            <p className="text-xs text-white/70">
              Tell us what you need and our team shortlists vetted drivers for
              you.
            </p>
          </div>
        </div>
        <Button
          asChild
          className="text-brand h-10 rounded-xl bg-white px-4 hover:bg-white/90"
        >
          <Link href="/dashboard/my-hire/request">Request a driver</Link>
        </Button>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <ShieldCheck className="size-4 text-emerald-600" />
        <p className="text-[15px] font-semibold">
          {isFetching && !drivers.length
            ? "Finding drivers…"
            : `${total} verified ${total === 1 ? "driver matches" : "drivers match"} your filters`}
        </p>
      </div>

      {isFetching && !drivers.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <Skeleton key={index} className="h-[210px] rounded-2xl" />
          ))}
        </div>
      ) : drivers.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No drivers match your filters"
          description="Loosen a filter or two - or check back soon, new drivers are verified every week."
          className="border-border rounded-2xl border bg-white py-12"
        />
      ) : (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
          isLoading={isFetching}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {drivers.map((driver) => (
              <TalentCard key={driver.id} driver={driver} />
            ))}
          </div>
        </Pagination>
      )}
    </div>
  );
}
