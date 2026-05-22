import * as React from "react";

import { cn } from "@/lib/utils";

const ToastAction = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "inline-flex h-9 shrink-0 items-center justify-center rounded-xl border border-border bg-muted px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </button>
));

ToastAction.displayName = "ToastAction";

export { ToastAction };
