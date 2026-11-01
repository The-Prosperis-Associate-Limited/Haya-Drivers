import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection = function ({
  title,
  description,
  children,
  className,
}: Props) {
  return (
    <section
      className={cn(
        "border-border space-y-4 border-t pt-4 first:border-t-0 first:pt-0",
        className,
      )}
    >
      <div>
        <h3 className="text-[12px] font-semibold tracking-wide text-slate-500 uppercase">
          {title}
        </h3>
        {description && (
          <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
};
