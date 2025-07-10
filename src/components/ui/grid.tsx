import * as React from "react"
import { cn } from "@/lib/utils"

const Grid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    cols?: number;
    gap?: string;
    minWidth?: string;
  }
>(({ className, cols, gap = "1.5rem", minWidth = "300px", ...props }, ref) => (
  <div
    ref={ref}
    className={cn("grid", className)}
    style={{
      gridTemplateColumns: cols 
        ? `repeat(${cols}, 1fr)` 
        : `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
      gap
    }}
    {...props}
  />
))
Grid.displayName = "Grid"

export { Grid } 