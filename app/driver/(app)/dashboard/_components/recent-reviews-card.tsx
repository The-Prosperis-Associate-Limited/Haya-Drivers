"use client";

import { AppText } from "@/components/shared/app-text";
import { StarRating } from "@/components/shared/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, getInitials } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useReviews } from "../reviews/_hooks/use-reviews";

export const RecentReviewsCard = function () {
  const { reviews, isFetching } = useReviews({ page: 1, limit: 2 });

  return (
    <div className="border-border rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-2 px-4 pt-4 md:px-5 md:pt-5">
        <AppText type="h4" className="text-[15px] font-semibold">
          Recent reviews
        </AppText>
        <Link
          href="/driver/dashboard/reviews"
          className="text-brand inline-flex items-center gap-0.5 text-[13px] font-semibold"
        >
          See all
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-2">
        {isFetching && !reviews.length ? (
          <div className="space-y-3 p-4 md:p-5">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        ) : !reviews.length ? (
          <AppText
            type="caption"
            className="text-muted-foreground block px-4 pb-5 md:px-5"
          >
            No reviews yet. Clients can review you once a job is underway.
          </AppText>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="space-y-1.5 border-t border-slate-100 px-4 py-3.5 first:border-t-0 md:px-5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar className="size-8">
                    <AvatarImage
                      src={review.author.profile_pic ?? undefined}
                      alt=""
                    />
                    <AvatarFallback className="text-[11px]">
                      {getInitials(
                        review.author.first_name,
                        review.author.last_name,
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <AppText
                      type="label"
                      className="block truncate text-[13px] font-semibold"
                    >
                      {[review.author.first_name, review.author.last_name]
                        .filter(Boolean)
                        .join(" ") || "Client"}
                    </AppText>
                    <AppText
                      type="caption"
                      className="text-muted-foreground block text-[11.5px]"
                    >
                      {formatDate(review.createdAt)}
                    </AppText>
                  </div>
                </div>
                <StarRating rating={review.rating} starClassName="size-3.5" />
              </div>
              {review.comment && (
                <AppText
                  type="body"
                  className="text-foreground/80 line-clamp-2 text-[13px]"
                >
                  &ldquo;{review.comment}&rdquo;
                </AppText>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
