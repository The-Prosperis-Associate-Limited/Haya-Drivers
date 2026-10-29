import { AppText } from "@/components/shared/app-text";
import { BackLink } from "@/components/shared/back-link";

interface Props {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}

export const PageHeader = function ({
  title,
  description,
  actions,
  back,
}: Props) {
  return (
    <div className="space-y-3">
      {back && <BackLink href={back.href} label={back.label} />}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <AppText
            type="h2"
            className="text-[22px] font-semibold tracking-tight"
          >
            {title}
          </AppText>
          {description && (
            <AppText
              type="subtitle"
              className="text-muted-foreground text-[13px]"
            >
              {description}
            </AppText>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
};
