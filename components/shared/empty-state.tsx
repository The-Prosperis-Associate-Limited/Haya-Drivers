import { cn } from "@/lib/utils";
import Image from "next/image";
import { AppText } from "./app-text";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon?: LucideIcon;
  illustration?: string;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  size?: "default" | "compact";
  className?: string;
}

export const EmptyState = function ({
  icon: Icon,
  illustration,
  title,
  description,
  action,
  size = "default",
  className,
}: Props) {
  const compact = size === "compact";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "px-4 py-6" : "px-6 py-14",
        className,
      )}
    >
      {illustration ? (
        <Image
          src={illustration}
          alt=""
          width={150}
          height={150}
          className="mb-5 h-auto w-[120px] md:w-[150px]"
          loading="eager"
        />
      ) : (
        Icon &&
        (compact ? (
          <div className="bg-brand-soft mb-3 grid size-10 place-items-center rounded-xl">
            <Icon className="text-brand size-5" />
          </div>
        ) : (
          <div className="bg-brand-soft mb-5 flex h-20 w-20 items-center justify-center rounded-full">
            <Icon className="text-brand h-9 w-9" />
          </div>
        ))
      )}

      <AppText
        type="h4"
        className={cn(
          "font-semibold",
          compact ? "max-w-sm text-sm" : "max-w-xs text-lg",
        )}
      >
        {title}
      </AppText>
      {description && (
        <AppText
          type="caption"
          className={cn(
            "text-muted-foreground block",
            compact ? "mt-1 max-w-sm text-xs" : "mt-2 max-w-xs",
          )}
        >
          {description}
        </AppText>
      )}
      {action && <div className={compact ? "mt-3" : "mt-6"}>{action}</div>}
    </div>
  );
};
