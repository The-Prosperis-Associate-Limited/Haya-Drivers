import { cn } from "@/lib/utils";
import { AppText } from "./app-text";
import { BackLink } from "./back-link";

interface Props {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  back?: { href: string; label: string };
  className?: string;
}

export const PageHeader = function ({
  title,
  subtitle,
  action,
  back,
  className,
}: Props) {
  return (
    <div className={cn("mb-6 space-y-3", className)}>
      {back && <BackLink href={back.href} label={back.label} />}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <AppText
            type="h2"
            className="text-[22px] font-semibold tracking-tight"
          >
            {title}
          </AppText>
          {subtitle && (
            <AppText
              type="subtitle"
              className="text-muted-foreground text-[13px]"
            >
              {subtitle}
            </AppText>
          )}
        </div>
        {action && (
          <div className="flex flex-wrap items-center gap-2">{action}</div>
        )}
      </div>
    </div>
  );
};
