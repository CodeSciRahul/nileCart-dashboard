import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge.jsx";
import { Button, ButtonLink } from "@/components/ui/button.jsx";
import { Card } from "@/components/ui/card.jsx";
import { BANNER_TYPES } from "@/constants/marketing.js";
import { getPublishStatus } from "@/lib/bannerUtils.js";
import { formatSchedule } from "@/lib/announcementUtils.js";
import {
  ArrowDown,
  ArrowUp,
  CalendarClock,
  Edit3,
  ImageIcon,
  Power,
  PowerOff,
  Sparkles,
  Trash2,
} from "lucide-react";

function typeLabel(type) {
  return BANNER_TYPES.find((t) => t.value === type)?.label || type || "Hero";
}

function BannerCard({
  banner,
  index,
  onEdit,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isToggling,
}) {
  const status = getPublishStatus(banner);
  const schedule = formatSchedule(banner.startsAt, banner.endsAt);
  const imageUrl =
    typeof banner.image === "string" ? banner.image : banner.image?.url;

  return (
    <Card
      className="group/ban relative overflow-hidden border-brand-amber/25 p-0 transition-all duration-500 hover:-translate-y-0.5 hover:border-brand-amber/40 hover:shadow-lg hover:shadow-brand-amber/10 animate-in fade-in slide-in-from-bottom-4 [animation-fill-mode:both]"
      style={{ animationDelay: `${index * 80}ms`, animationDuration: "450ms" }}
    >
      <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
        <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-brand-cream sm:w-40">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-brand-amber">
              <ImageIcon className="size-8" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-lg font-bold tracking-tight">{banner.title}</p>
            {banner.subtitle && (
              <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">{typeLabel(banner.type)}</Badge>
            <Badge variant={status.variant}>{status.label}</Badge>
            <Badge variant="secondary">Order {banner.displayOrder ?? 0}</Badge>
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <CalendarClock className="mt-0.5 size-3.5 shrink-0 text-brand-amber" />
            <p className="leading-relaxed">{schedule.short}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch lg:flex-row">
          <Button
            size="sm"
            variant="outline"
            disabled={isFirst}
            onClick={() => onMoveUp(banner)}
            className="border-brand-amber/20"
          >
            <ArrowUp className="size-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isLast}
            onClick={() => onMoveDown(banner)}
            className="border-brand-amber/20"
          >
            <ArrowDown className="size-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(banner._id)}
            className="border-brand-amber/25 bg-brand-white hover:bg-brand-cream"
          >
            <Edit3 className="size-3.5" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isToggling}
            onClick={() =>
              onToggle({ id: banner._id, isActive: !banner.isActive })
            }
          >
            {banner.isActive ? (
              <>
                <PowerOff className="size-3.5" />
                Unpublish
              </>
            ) : (
              <>
                <Power className="size-3.5" />
                Publish
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(banner._id)}
          >
            <Trash2 className="size-3.5" />
            Remove
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function BannerCatalog({
  banners,
  isLoading,
  onEdit,
  onToggle,
  onDelete,
  onReorder,
  isToggling,
}) {
  const sorted = useMemo(
    () =>
      [...banners].sort(
        (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
      ),
    [banners]
  );

  const stats = useMemo(() => {
    const total = banners.length;
    const live = banners.filter(
      (b) => getPublishStatus(b).label === "Live"
    ).length;
    const scheduled = banners.filter(
      (b) => getPublishStatus(b).label === "Scheduled"
    ).length;
    return { total, live, scheduled };
  }, [banners]);

  const move = (banner, direction) => {
    const index = sorted.findIndex((b) => b._id === banner._id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    const next = [...sorted];
    const a = next[index];
    const b = next[swapIndex];
    const orderA = a.displayOrder ?? index * 10;
    const orderB = b.displayOrder ?? swapIndex * 10;

    onReorder([
      { id: a._id, displayOrder: orderB },
      { id: b._id, displayOrder: orderA },
    ]);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl border border-brand-amber/10 bg-brand-cream/30"
          />
        ))}
      </div>
    );
  }

  if (!sorted.length) {
    return (
      <Card className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-amber/15 text-brand-amber ring-1 ring-brand-amber/20">
          <ImageIcon className="size-8" />
        </span>
        <div>
          <p className="text-lg font-bold">No banners yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a hero banner to power the storefront carousel.
          </p>
        </div>
        <ButtonLink to="/admin/banners/new">Create banner</ButtonLink>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total", value: stats.total, icon: ImageIcon },
          { label: "Live", value: stats.live, icon: Sparkles },
          { label: "Scheduled", value: stats.scheduled, icon: CalendarClock },
        ].map(({ label, value, icon: Icon }, i) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-3 rounded-xl border border-brand-amber/15 bg-brand-white/80 p-4 shadow-sm"
            )}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-amber/15 text-brand-amber ring-1 ring-brand-amber/20">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                {label}
              </p>
              <p className="text-2xl font-black">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {sorted.map((banner, index) => (
          <BannerCard
            key={banner._id}
            banner={banner}
            index={index}
            isFirst={index === 0}
            isLast={index === sorted.length - 1}
            onEdit={onEdit}
            onToggle={onToggle}
            onDelete={onDelete}
            onMoveUp={(b) => move(b, "up")}
            onMoveDown={(b) => move(b, "down")}
            isToggling={isToggling}
          />
        ))}
      </div>
    </div>
  );
}
