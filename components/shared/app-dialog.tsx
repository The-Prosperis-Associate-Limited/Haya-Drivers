import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PrimaryAction {
  label: string;
  onClick?: () => void;
  form?: string;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: "default" | "destructive";
}

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  dialogFooter?: React.ReactNode;
  primaryAction?: PrimaryAction;
  cancelLabel?: string;
  footerStart?: React.ReactNode;
  width?: string;
  height?: string;
  isSubmitting?: boolean;
}

export const DIALOG_BUTTON = "h-10 rounded-xl px-5";

export const AppDialog = function ({
  isOpen,
  onOpenChange,
  children,
  title,
  description,
  dialogFooter,
  primaryAction,
  cancelLabel = "Cancel",
  footerStart,
  width,
  height,
  isSubmitting,
}: Props) {
  const handleOpenChange = (open: boolean) => {
    if (!open && isSubmitting) return; // block close while request is in flight
    onOpenChange(open);
  };

  const footer =
    dialogFooter ??
    (primaryAction && (
      <>
        {footerStart && <div className="mr-auto">{footerStart}</div>}
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => onOpenChange(false)}
          className={DIALOG_BUTTON}
        >
          {cancelLabel}
        </Button>
        <Button
          type={primaryAction.form ? "submit" : "button"}
          form={primaryAction.form}
          variant={primaryAction.variant}
          onClick={primaryAction.onClick}
          isLoading={primaryAction.isLoading}
          disabled={primaryAction.disabled}
          className={DIALOG_BUTTON}
        >
          {primaryAction.label}
        </Button>
      </>
    ));

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0"
        style={
          width || height
            ? { width, maxWidth: "calc(100vw - 2rem)", maxHeight: height }
            : undefined
        }
        onInteractOutside={(e) => {
          if (isSubmitting) e.preventDefault(); // backdrop click
        }}
        onEscapeKeyDown={(e) => {
          if (isSubmitting) e.preventDefault(); // Escape key
        }}
      >
        <DialogHeader className="border-b px-5 py-4 pr-12 md:px-6">
          <DialogTitle className="text-[15px] font-semibold">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-[13px]">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 py-4 md:px-6">
          {children}
        </div>

        {footer && (
          <DialogFooter className="border-t bg-slate-50/70 px-5 py-3.5 md:px-6">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
