import * as React from "react";
import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";

type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}

const itemBase =
  "relative flex items-center gap-[var(--space-2)] py-2 px-3 rounded-[calc(var(--radius)-2px)] cursor-pointer outline-none select-none transition-colors duration-[80ms] data-[highlighted]:bg-background-muted hover:bg-background-muted data-[disabled]:opacity-[var(--opacity-disabled)] data-[disabled]:pointer-events-none motion-reduce:transition-none";
const itemCheck = "pl-7";
const contentClasses =
  "min-w-40 max-h-[min(24rem,var(--available-height,24rem))] overflow-y-auto p-[var(--space-1)] bg-background text-foreground border border-border rounded-[var(--radius)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-2px_rgba(0,0,0,0.05)] text-[length:var(--text-sm)] origin-[var(--transform-origin)] animate-[sh-ui-cm-in_140ms_ease-out] data-[ending-style]:animate-[sh-ui-cm-out_100ms_ease-in_forwards] outline-none motion-reduce:animate-none motion-reduce:data-[ending-style]:animate-none";

export const ContextMenu = BaseContextMenu.Root;

export const ContextMenuTrigger = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseContextMenu.Trigger>>
>(function ContextMenuTrigger({ className, ...props }, ref) {
  return <BaseContextMenu.Trigger ref={ref} className={cx("contents", className)} {...props} />;
});

export interface ContextMenuContentProps
  extends WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseContextMenu.Popup>> {
  container?: React.ComponentPropsWithoutRef<typeof BaseContextMenu.Portal>["container"];
}

export const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(
  function ContextMenuContent({ className, children, container, ...props }, ref) {
    return (
      <BaseContextMenu.Portal container={container}>
        <BaseContextMenu.Positioner className="outline-none z-[var(--z-dropdown)]">
          <BaseContextMenu.Popup ref={ref} className={cx(contentClasses, className)} {...props}>
            {children}
          </BaseContextMenu.Popup>
        </BaseContextMenu.Positioner>
      </BaseContextMenu.Portal>
    );
  },
);

export const ContextMenuItem = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseContextMenu.Item>>
>(function ContextMenuItem({ className, ...props }, ref) {
  return <BaseContextMenu.Item ref={ref} className={cx(itemBase, className)} {...props} />;
});

export const ContextMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseContextMenu.CheckboxItem>>
>(function ContextMenuCheckboxItem({ className, children, ...props }, ref) {
  return (
    <BaseContextMenu.CheckboxItem ref={ref} className={cx(itemBase, itemCheck, className)} {...props}>
      <span className="absolute left-2 inline-flex items-center justify-center w-4 h-4 text-foreground" aria-hidden>
        <BaseContextMenu.CheckboxItemIndicator>
          <CheckIcon />
        </BaseContextMenu.CheckboxItemIndicator>
      </span>
      <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{children}</span>
    </BaseContextMenu.CheckboxItem>
  );
});

export const ContextMenuRadioGroup = BaseContextMenu.RadioGroup;

export const ContextMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseContextMenu.RadioItem>>
>(function ContextMenuRadioItem({ className, children, ...props }, ref) {
  return (
    <BaseContextMenu.RadioItem ref={ref} className={cx(itemBase, itemCheck, className)} {...props}>
      <span className="absolute left-2 inline-flex items-center justify-center w-4 h-4 text-foreground" aria-hidden>
        <BaseContextMenu.RadioItemIndicator>
          <DotIcon />
        </BaseContextMenu.RadioItemIndicator>
      </span>
      <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{children}</span>
    </BaseContextMenu.RadioItem>
  );
});

export const ContextMenuGroup = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseContextMenu.Group>>
>(function ContextMenuGroup({ className, ...props }, ref) {
  return <BaseContextMenu.Group ref={ref} className={cx("p-0", className)} {...props} />;
});

export const ContextMenuLabel = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseContextMenu.GroupLabel>>
>(function ContextMenuLabel({ className, ...props }, ref) {
  return (
    <BaseContextMenu.GroupLabel
      ref={ref}
      className={cx(
        "py-[var(--space-2)] px-[var(--space-2)] pb-[var(--space-1)] text-[length:var(--text-xs)] font-semibold text-foreground-muted uppercase tracking-[0.04em]",
        className,
      )}
      {...props}
    />
  );
});

export const ContextMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function ContextMenuSeparator({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="horizontal"
        className={cx("h-px bg-border my-[var(--space-1)]", className)}
        {...props}
      />
    );
  },
);

export const ContextMenuSub = BaseContextMenu.SubmenuRoot;

export const ContextMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  WithStringClassName<React.ComponentPropsWithoutRef<typeof BaseContextMenu.SubmenuTrigger>>
>(function ContextMenuSubTrigger({ className, children, ...props }, ref) {
  return (
    <BaseContextMenu.SubmenuTrigger
      ref={ref}
      className={cx(itemBase, "data-[popup-open]:bg-background-muted", className)}
      {...props}
    >
      <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{children}</span>
      <span className="inline-flex items-center justify-center ml-auto text-foreground-muted" aria-hidden>
        <ChevronRightIcon />
      </span>
    </BaseContextMenu.SubmenuTrigger>
  );
});

export const ContextMenuSubContent = ContextMenuContent;

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DotIcon() {
  return <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden><circle cx="4" cy="4" r="3" /></svg>;
}
function ChevronRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

if (typeof document !== "undefined" && !document.querySelector("style[data-sh-ui-cm]")) {
  const style = document.createElement("style");
  style.setAttribute("data-sh-ui-cm", "");
  style.textContent = `
@keyframes sh-ui-cm-in { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
@keyframes sh-ui-cm-out { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.96); } }
  `;
  document.head.appendChild(style);
}
