import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Shimmer sweep over a muted base; reduced-motion users get the plain
        // pulse instead (no sweep).
        "rounded-md bg-muted animate-shimmer motion-reduce:animate-pulse",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
