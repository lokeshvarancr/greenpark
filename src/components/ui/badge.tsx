import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils.tsx"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-blue-700/90 dark:bg-blue-700 dark:text-white",
        secondary:
          "border-transparent bg-blue-100 text-blue-800 [a&]:hover:bg-blue-200/90 dark:bg-blue-900 dark:text-blue-100",
        destructive:
          "border-transparent bg-red-600 text-white [a&]:hover:bg-red-700/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-red-700/60",
        outline:
          "text-blue-700 border-blue-500 [a&]:hover:bg-blue-50 [a&]:hover:text-blue-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
