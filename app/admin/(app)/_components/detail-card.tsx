import { AppText } from "@/components/shared/app-text";
import { cn } from "@/lib/utils";

interface CardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const DetailCard = function ({
  title,
  subtitle,
  action,
  children,
  className,
}: CardProps) {
  return (
    <div
      className={cn(
        "border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <AppText type="h4" className="text-[15px] font-semibold">
            {title}
          </AppText>
          {subtitle && (
            <AppText type="caption" className="text-muted-foreground block">
              {subtitle}
            </AppText>
          )}
        </div>
        {action}
      </div>
      <div className="divide-border mt-3 divide-y">{children}</div>
    </div>
  );
};

interface RowProps {
  label: string;
  value?: React.ReactNode;
}

export const DetailRow = function ({ label, value }: RowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <AppText type="caption" className="text-muted-foreground shrink-0">
        {label}
      </AppText>
      <AppText
        type="caption"
        className="text-foreground text-right font-medium"
      >
        {value || "-"}
      </AppText>
    </div>
  );
};
