import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  description?: React.ReactNode;
  icon?: LucideIcon;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const SettingsCard = function ({
  title,
  description,
  icon: Icon,
  footer,
  children,
  className,
}: Props) {
  return (
    <section
      className={cn(
        "border-border rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        className,
      )}
    >
      <header className="flex items-start gap-3 px-4 pt-4 md:px-5 md:pt-5">
        {Icon && (
          <span className="bg-brand-soft text-brand grid size-9 shrink-0 place-items-center rounded-xl">
            <Icon className="size-4" />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold">{title}</h3>
          {description && (
            <p className="text-muted-foreground mt-0.5 text-[13px]">
              {description}
            </p>
          )}
        </div>
      </header>

      <div className="px-4 pt-4 pb-4 md:px-5 md:pb-5">{children}</div>

      {footer && (
        <footer className="border-border flex flex-wrap items-center justify-end gap-2 rounded-b-2xl border-t bg-slate-50/70 px-4 py-3 md:px-5">
          {footer}
        </footer>
      )}
    </section>
  );
};
