import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, error = false, ...props }, ref) => {
  const hasError = error || props["aria-invalid"] === true || props["aria-invalid"] === "true"
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        hasError && "border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-0",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Input.displayName = "Input"

export { Input }
