"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    orientation?: "horizontal" | "vertical"
    decorative?: boolean
    asChild?: boolean
  }
>(({ className, orientation = "horizontal", decorative = true, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      data-slot="separator"
      ref={ref}
      role={decorative ? "none" : "separator"}
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  )
})
Separator.displayName = "Separator"

export { Separator }
