import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card.jsx";

const iconBgClasses = [
  "bg-brand-amber/15 text-brand-amber ring-brand-amber/20",
  "bg-amber-100/80 text-amber-700 ring-amber-200/50",
  "bg-orange-100/80 text-orange-700 ring-orange-200/50",
  "bg-yellow-100/80 text-yellow-700 ring-yellow-200/50",
  "bg-brand-cream text-amber-700 ring-brand-amber/15",
  "bg-amber-50 text-amber-600 ring-brand-amber/10",
];

export function StatCard({ label, value, icon: Icon, index = 0, isLoading }) {
  const iconBg = iconBgClasses[index % iconBgClasses.length];

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start justify-between gap-4 pt-0">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
            {label}
          </p>
          <p className="text-3xl font-black tracking-tight text-foreground">
            {isLoading ? (
              <span className="inline-block h-8 w-16 animate-pulse rounded-lg bg-brand-cream" />
            ) : (
              (value ?? "—")
            )}
          </p>
        </div>
        {Icon && (
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1",
              iconBg
            )}
          >
            <Icon className="size-5" />
          </span>
        )}
      </CardContent>
    </Card>
  );
}
