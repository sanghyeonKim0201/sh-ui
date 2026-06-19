import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@SH_UI_UTILS@";
import { Dialog, DialogContent, DialogTitle } from "../dialog";

export const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex flex-col w-full bg-[var(--popover,var(--background))] text-foreground rounded-[var(--radius)] overflow-hidden",
      className
    )}
    {...props}
  />
));
Command.displayName = "Command";

export interface CommandDialogProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
}

export function CommandDialog({ open, onOpenChange, title = "명령 팔레트", children, ...props }: CommandDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <Command {...props}>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}

export const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="border-b border-border px-[var(--space-3)]">
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "w-full h-[var(--control-md)] bg-transparent border-none outline-none text-foreground text-[length:var(--text-sm)] placeholder:text-foreground-muted",
        className
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = "CommandInput";

export const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-80 overflow-y-auto p-[var(--space-1)]", className)}
    {...props}
  />
));
CommandList.displayName = "CommandList";

export const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={cn("p-[var(--space-4)] text-center text-foreground-muted text-[length:var(--text-sm)]", className)}
    {...props}
  />
));
CommandEmpty.displayName = "CommandEmpty";

export const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "[&_[cmdk-group-heading]]:px-[var(--space-2)] [&_[cmdk-group-heading]]:py-[var(--space-1)] [&_[cmdk-group-heading]]:text-[length:var(--text-xs)] [&_[cmdk-group-heading]]:text-foreground-muted",
      className
    )}
    {...props}
  />
));
CommandGroup.displayName = "CommandGroup";

export const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("h-px bg-border my-[var(--space-1)]", className)}
    {...props}
  />
));
CommandSeparator.displayName = "CommandSeparator";

export const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "flex items-center gap-[var(--space-2)] px-[var(--space-2)] py-[var(--space-2)] rounded-[calc(var(--radius)-2px)] text-[length:var(--text-sm)] cursor-pointer select-none data-[selected=true]:bg-background-muted aria-selected:bg-background-muted data-[disabled=true]:text-foreground-muted",
      className
    )}
    {...props}
  />
));
CommandItem.displayName = "CommandItem";

export function CommandShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("ms-auto text-[length:var(--text-xs)] text-foreground-muted tracking-wider", className)}
      {...props}
    />
  );
}
CommandShortcut.displayName = "CommandShortcut";
