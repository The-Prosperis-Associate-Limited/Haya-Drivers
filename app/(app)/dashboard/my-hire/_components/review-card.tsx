"use client";

import { AppText } from "@/components/shared/app-text";
import { AppTextArea } from "@/components/shared/app-textarea";
import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn, formatDate } from "@/lib/utils";
import { Star } from "lucide-react";
import { useState } from "react";
import type { HireDetail } from "@/types/booking";

// Mirrors REVIEW_CRITERIA on the server - a key outside this list is a 400.
const CRITERIA = [
  "Reliability",
  "Professionalism",
  "Driving skill & safety",
  "Route knowledge",
  "Vehicle care",
] as const;

interface Props {
  hire: HireDetail;
}

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          aria-label={`${score} star${score > 1 ? "s" : ""}`}
          onClick={() => onChange(score)}
          className="cursor-pointer"
        >
          <Star
            className={cn(
              "h-5 w-5 transition-colors",
              score <= value
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300",
            )}
          />
        </button>
      ))}
    </span>
  );
}

export const ReviewCard = function ({ hire }: Props) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");

  const driverName =
    [hire.driver?.first_name, hire.driver?.last_name]
      .filter(Boolean)
      .join(" ") || "this driver";

  const { mutate: submitReview, isPending } = useSubmitData({
    url: API_ENDPOINTS.bookings.review(hire.reference),
    method: "post",
    onSuccessMessage: "Review submitted",
  });

  const rated = Object.keys(scores).length;

  if (hire.my_review) {
    return (
      <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
        <AppText type="h4" className="text-[15px] font-semibold">
          Your review
        </AppText>
        <span className="mt-3 flex items-center gap-2">
          <StarRating rating={hire.my_review.rating} />
          <AppText type="caption" className="text-muted-foreground">
            {formatDate(hire.my_review.createdAt)}
          </AppText>
        </span>
        {hire.my_review.criteria && (
          <div className="mt-4 space-y-2">
            {Object.entries(hire.my_review.criteria).map(([label, score]) => (
              <span
                key={label}
                className="flex items-center justify-between gap-3"
              >
                <AppText type="caption" className="text-muted-foreground">
                  {label}
                </AppText>
                <StarRating rating={score} />
              </span>
            ))}
          </div>
        )}
        {hire.my_review.comment && (
          <AppText
            type="caption"
            className="text-muted-foreground mt-4 block leading-relaxed"
          >
            "{hire.my_review.comment}"
          </AppText>
        )}
      </div>
    );
  }

  return (
    <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
      <AppText type="h4" className="text-[15px] font-semibold">
        Leave a review
      </AppText>

      <div className="mt-4 space-y-3">
        {CRITERIA.map((criterion) => (
          <span
            key={criterion}
            className="flex items-center justify-between gap-3"
          >
            <AppText type="caption" className="text-ink">
              {criterion}
            </AppText>
            <StarInput
              value={scores[criterion] ?? 0}
              onChange={(value) =>
                setScores((current) => ({ ...current, [criterion]: value }))
              }
            />
          </span>
        ))}
      </div>

      <div className="mt-5">
        <AppTextArea
          label="Additional comments (optional)"
          placeholder={`What stood out about working with ${driverName}?`}
          rows={3}
          maxLength={1000}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
      </div>

      <Button
        className="mt-4 h-11 rounded-xl px-6 text-sm"
        isLoading={isPending}
        disabled={rated === 0}
        onClick={() =>
          submitReview({
            criteria: scores,
            comment: comment.trim() || undefined,
          })
        }
      >
        Submit review
      </Button>
    </div>
  );
};
