import { AppText } from "@/components/shared/app-text";
import { StarRating } from "@/components/shared/star-rating";
import { TrustRing } from "@/components/drivers/trust-ring";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  cn,
  driverTypeLabel,
  formatMoney,
  formatRelativeTime,
  getInitials,
} from "@/lib/utils";
import { BadgeCheck, CircleCheck, ShieldCheck } from "lucide-react";
import type { DriverReview, PublicDriverProfile } from "@/types/driver";

interface Props {
  profile: PublicDriverProfile;
  reviews: Pick<
    DriverReview,
    "id" | "rating" | "comment" | "createdAt" | "author"
  >[];
  action?: React.ReactNode;
}

// The checks an APPROVED driver has actually passed - identity (NIN slip),
// licence and guarantor documents are what verification reviews. A police
// record check does not exist yet, so it is not listed.
const VERIFIED_CHECKS = ["NIMC identity", "FRSC licence", "Guarantor"];

const CARD =
  "border-border rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-6";

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={CARD}>
      <span className="flex items-center gap-2">
        {icon}
        <AppText type="h3" className="text-[15px] font-semibold">
          {title}
        </AppText>
      </span>
      {children}
    </div>
  );
}

export const driverNameOf = (profile: PublicDriverProfile) =>
  [profile.user.first_name, profile.user.last_name].filter(Boolean).join(" ") ||
  "Driver";

export const DriverPublicProfile = function ({
  profile,
  reviews,
  action,
}: Props) {
  const name = driverNameOf(profile);
  const available = profile.open_to_work !== false;

  const location = [profile.user.city, profile.user.state_of_residence]
    .filter(Boolean)
    .join(", ");

  const facts = [
    {
      label: "Rating",
      value: profile.review_count ? profile.rating.toFixed(1) : "-",
      hint: profile.review_count
        ? `${profile.review_count} review${profile.review_count > 1 ? "s" : ""}`
        : "No reviews yet",
    },
    {
      label: "Jobs completed",
      value: String(profile.completed_jobs ?? 0),
      hint: "On Haya Drivers",
    },
    {
      label: "On-time rate",
      value: profile.on_time_rate === null ? "-" : `${profile.on_time_rate}%`,
      hint:
        profile.on_time_rate === null
          ? "No started jobs yet"
          : "Start time vs schedule",
    },
    {
      label: "Experience",
      value:
        profile.years_of_experience != null
          ? `${profile.years_of_experience} yrs`
          : "-",
      hint: driverTypeLabel(profile.driver_type),
    },
  ];

  return (
    <div className="space-y-5 lg:space-y-6">
      <div className="border-border overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="from-brand-soft/80 bg-gradient-to-r to-white p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative shrink-0">
                <Avatar className="size-16">
                  <AvatarImage
                    src={profile.user.profile_pic ?? undefined}
                    alt=""
                  />
                  <AvatarFallback className="text-base">
                    {getInitials(
                      profile.user.first_name,
                      profile.user.last_name,
                    )}
                  </AvatarFallback>
                </Avatar>
                <BadgeCheck className="fill-brand absolute -right-0.5 -bottom-0.5 size-5 text-white" />
              </div>
              <div className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <AppText
                    type="h2"
                    className="text-xl font-semibold tracking-tight"
                  >
                    {name}
                  </AppText>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      available
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {available ? "Available now" : "Not taking new jobs"}
                  </span>
                </span>
                <AppText type="caption" className="text-muted-foreground block">
                  {[driverTypeLabel(profile.driver_type), location]
                    .filter(Boolean)
                    .join(" · ")}
                </AppText>
              </div>
            </div>
            {action}
          </div>
        </div>

        <dl className="grid grid-cols-2 border-t border-slate-100 md:grid-cols-4">
          {facts.map((fact, index) => (
            <div
              key={fact.label}
              className={cn(
                "p-4 md:px-6",
                index % 2 === 1 && "border-l border-slate-100",
                index > 1 && "border-t border-slate-100 md:border-t-0",
                index > 0 && "md:border-l",
              )}
            >
              <dt className="text-muted-foreground text-xs">{fact.label}</dt>
              <dd className="text-ink mt-1 text-xl font-semibold tracking-tight">
                {fact.value}
              </dd>
              <dd className="text-muted-foreground text-xs">{fact.hint}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-6">
        <div className="min-w-0 space-y-5 xl:space-y-6">
          <Card title="About">
            <AppText
              type="subtitle"
              className="text-muted-foreground mt-3 block text-sm leading-relaxed"
            >
              {profile.user.bio || "This driver hasn't written a bio yet."}
            </AppText>
          </Card>

          <Card title="Work history">
            {profile.work_experiences.length === 0 ? (
              <AppText
                type="caption"
                className="text-muted-foreground mt-3 block"
              >
                No work history shared yet.
              </AppText>
            ) : (
              <div className="mt-3 space-y-4">
                {profile.work_experiences.map((experience) => (
                  <span
                    key={experience.id}
                    className="flex items-start justify-between gap-3"
                  >
                    <span>
                      <AppText type="label" className="block text-sm">
                        {experience.job_title}
                      </AppText>
                      <AppText
                        type="caption"
                        className="text-muted-foreground block"
                      >
                        {experience.employer}
                      </AppText>
                    </span>
                    <AppText
                      type="caption"
                      className="text-muted-foreground shrink-0"
                    >
                      {new Date(experience.started_at).getFullYear()} -{" "}
                      {experience.is_current || !experience.ended_at
                        ? "Present"
                        : new Date(experience.ended_at).getFullYear()}
                    </AppText>
                  </span>
                ))}
              </div>
            )}
          </Card>

          <Card title="Client reviews">
            {reviews.length === 0 ? (
              <AppText
                type="caption"
                className="text-muted-foreground mt-3 block"
              >
                No reviews yet.
              </AppText>
            ) : (
              <div className="mt-3 divide-y">
                {reviews.slice(0, 4).map((review) => (
                  <div key={review.id} className="py-4 first:pt-0 last:pb-0">
                    <span className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={review.author.profile_pic ?? undefined}
                          alt=""
                        />
                        <AvatarFallback>
                          {getInitials(
                            review.author.first_name,
                            review.author.last_name,
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <AppText type="label" className="text-sm">
                        {[review.author.first_name, review.author.last_name]
                          .filter(Boolean)
                          .join(" ") || "Client"}
                      </AppText>
                    </span>
                    <span className="mt-2 flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      <AppText type="caption" className="text-muted-foreground">
                        {formatRelativeTime(review.createdAt)}
                      </AppText>
                    </span>
                    {review.comment && (
                      <AppText
                        type="caption"
                        className="text-foreground/80 mt-2 block leading-relaxed"
                      >
                        &ldquo;{review.comment}&rdquo;
                      </AppText>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="min-w-0 space-y-5 xl:space-y-6">
          <Card title="Trust score">
            <div className="mt-4 flex items-center gap-4">
              <TrustRing
                score={profile.trust_score}
                size={92}
                strokeWidth={8}
                label={null}
                caption="out of 100"
                valueClassName="text-2xl"
              />
              <AppText type="caption" className="text-muted-foreground">
                Based on verified documents, client reviews and reliability.
              </AppText>
            </div>
          </Card>

          <Card
            title="Verified checks"
            icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />}
          >
            <div className="mt-4 space-y-3">
              {VERIFIED_CHECKS.map((check) => (
                <span key={check} className="flex items-center gap-2">
                  <CircleCheck className="h-4 w-4 text-emerald-600" />
                  <AppText type="caption" className="text-ink">
                    {check}
                  </AppText>
                </span>
              ))}
            </div>
          </Card>

          <Card title="Rate">
            <AppText type="h2" className="mt-3 block text-2xl font-semibold">
              {profile.expected_monthly_rate
                ? `${formatMoney(profile.expected_monthly_rate, profile.rate_currency)} / month`
                : "Not set"}
            </AppText>
            <AppText type="caption" className="text-muted-foreground block">
              {driverTypeLabel(profile.driver_type)}
            </AppText>
          </Card>
        </div>
      </div>
    </div>
  );
};
