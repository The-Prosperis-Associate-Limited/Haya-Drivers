import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const StepPanel = function ({ title, description, icon: Icon, aside, children, className }: Props) {
  return (
    <section className={cn("border-border rounded-[18px] border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-[22px]", className)}>
      {title && (
        <div className="mb-4 flex items-center gap-2.5">
          {Icon && (
            <span className="bg-brand-soft text-brand grid size-[34px] shrink-0 place-items-center rounded-[10px]">
              <Icon className="size-4" />
            </span>
          )}
          <div className="min-w-0">
            <h3 className="text-[14.5px] font-semibold">{title}</h3>
            {description && <p className="text-muted-foreground text-xs">{description}</p>}
          </div>
          {aside && <div className="ml-auto shrink-0">{aside}</div>}
        </div>
      )}
      {children}
    </section>
  );
};

export const StepNote = function ({ icon: Icon, children, tone = "brand" }: { icon: LucideIcon; children: React.ReactNode; tone?: "brand" | "amber" | "red" }) {
  return (
    <p
      className={cn(
        "flex gap-2.5 rounded-xl px-3.5 py-3 text-[12.5px]",
        tone === "brand" && "bg-brand-soft text-blue-900",
        tone === "amber" && "bg-amber-50 text-amber-900",
        tone === "red" && "bg-red-50 text-red-800",
      )}
    >
      <Icon className={cn("mt-px size-4 shrink-0", tone === "brand" && "text-brand", tone === "amber" && "text-amber-600", tone === "red" && "text-red-600")} />
      <span>{children}</span>
    </p>
  );
};
