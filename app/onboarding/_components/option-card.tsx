import { cn } from "@/lib/utils";
import { Check, type LucideIcon } from "lucide-react";

interface Props {
  label: string;
  blurb?: string;
  selected: boolean;
  onSelect: () => void;
  icon?: LucideIcon;
  className?: string;
}

export const OptionCard = function ({ label, blurb, selected, onSelect, icon: Icon, className }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "border-border relative grid gap-1 rounded-2xl border-[1.5px] bg-white p-4 text-left transition-all",
        selected ? "border-brand ring-brand-soft ring-4" : "hover:border-blue-200",
        className,
      )}
    >
      <span className={cn("absolute top-3 right-3 grid size-[22px] place-items-center rounded-full border-[1.5px]", selected ? "border-brand bg-brand text-white" : "border-border text-transparent")}>
        <Check className="size-3" strokeWidth={3} />
      </span>
      {Icon && (
        <span className={cn("mb-1.5 grid size-[38px] place-items-center rounded-xl", selected ? "bg-brand text-white" : "bg-slate-100 text-slate-700")}>
          <Icon className="size-5" />
        </span>
      )}
      <span className="pr-7 text-sm font-semibold">{label}</span>
      {blurb && <span className="text-muted-foreground text-[12.5px]">{blurb}</span>}
    </button>
  );
};
