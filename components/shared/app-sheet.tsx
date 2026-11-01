import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title: string;
  description?: string;
  side?: "top" | "right" | "bottom" | "left";
  sheetFooter?: React.ReactNode;
  width?: string;
  // A back chevron and the like, rendered before the title.
  headerLeading?: React.ReactNode;
  bodyClassName?: string;
}

export const AppSheet = function ({
  isOpen,
  onOpenChange,
  children,
  title,
  description,
  side = "right",
  sheetFooter,
  width,
  headerLeading,
  bodyClassName,
}: Props) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          "flex flex-col gap-0 p-0",
          side === "bottom" && "h-auto max-h-[85vh]",
        )}
        style={width ? { width, maxWidth: "100vw" } : undefined}
      >
        <SheetHeader
          className={cn(
            "border-b px-6 py-4",
            headerLeading && "flex-row items-center gap-3",
          )}
        >
          {headerLeading}

          <div className="min-w-0 flex-1">
            <SheetTitle className="truncate">{title}</SheetTitle>
            {description && (
              <SheetDescription className="truncate">
                {description}
              </SheetDescription>
            )}
          </div>
        </SheetHeader>

        <div className={cn("flex-1 overflow-y-auto px-6 py-4", bodyClassName)}>
          {children}
        </div>

        {sheetFooter && (
          <SheetFooter className="border-t px-6 py-4">
            {sheetFooter}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};
