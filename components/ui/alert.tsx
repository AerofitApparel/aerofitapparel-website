import * as React from "react"

import { cn } from "@/lib/utils"

const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive [&>svg]:h-4 [&>svg]:w-4",
          className,
        )}
        role="alert"
        {...props}
      >
        {children}
      </div>
    )
  },
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <h5 ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props}>
        {children}
      </h5>
    )
  },
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("text-sm opacity-70", className)} {...props}>
        {children}
      </div>
    )
  },
)
AlertDescription.displayName = "AlertDescription"

import { AlertCircle } from "lucide-react"

export { Alert, AlertTitle, AlertDescription, AlertCircle }
