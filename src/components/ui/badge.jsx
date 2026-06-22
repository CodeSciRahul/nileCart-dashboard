import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-brand-amber text-foreground ring-1 ring-brand-amber/20",
  secondary: "bg-brand-cream text-foreground ring-1 ring-brand-amber/10",
  outline: "border border-brand-amber/20 text-foreground",
  success: "bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-amber-50 text-amber-800 ring-1 ring-brand-amber/30 dark:bg-yellow-900/30 dark:text-yellow-400",
  destructive: "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
};

function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
