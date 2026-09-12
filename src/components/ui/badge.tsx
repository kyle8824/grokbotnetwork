import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "border-border bg-secondary text-muted-foreground",
        wire: "border-transparent bg-accent/15 text-accent",
        paper: "border-transparent bg-primary/10 text-primary",
        warn: "border-transparent bg-warn/15 text-warn",
        ok: "border-transparent bg-ok/15 text-ok",
        dissent: "border-transparent bg-destructive/15 text-destructive",
        outline: "border-border text-muted-foreground",
        ogb: "border-transparent bg-amber-500/15 text-amber-200",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
