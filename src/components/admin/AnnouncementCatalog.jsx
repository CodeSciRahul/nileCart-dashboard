import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge.jsx";
import { Button, ButtonLink } from "@/components/ui/button.jsx";
import { Card } from "@/components/ui/card.jsx";
import { formatSchedule } from "@/lib/announcementUtils.js";
import {
  CalendarClock,
  Edit3,
  Megaphone,
  Power,
  PowerOff,
  Sparkles,
  Trash2,
  TrendingUp,
} from "lucide-react";

function AnnouncementCard({
  announcement,
  index,
  onEdit,
  onToggle,
  onDelete,
  isToggling,
}) {
  const schedule = formatSchedule(announcement.startsAt, announcement.endsAt);

  return (
    <Card
      className="group/ann relative overflow-hidden border-brand-amber/25 p-0 transition-all duration-500 hover:-translate-y-0.5 hover:border-brand-amber/40 hover:shadow-lg hover:shadow-brand-amber/10 animate-in fade-in slide-in-from-bottom-4 [animation-fill-mode:both]"
      style={{ animationDelay: `${index * 80}ms`, animationDuration: "450ms" }}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-brand-amber/15 blur-3xl transition-opacity duration-500 group-hover/ann:opacity-80" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-brand-amber/30 to-transparent" />

      <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div
            className="inline-flex max-w-full items-center rounded-full px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-black/5"
            style={{
              backgroundColor: announcement.backgroundColor || "#fff5d1",
              color: announcement.textColor || "#1a1a1a",
            }}
          >
            <Megaphone className="mr-2 size-4 shrink-0 opacity-70" />
            <span className="truncate">{announcement.message}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default" className="gap-1">
              <TrendingUp className="size-3" />
              Priority {announcement.priority ?? 0}
            </Badge>
            <Badge variant={announcement.isActive ? "success" : "secondary"}>
              {announcement.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <CalendarClock className="mt-0.5 size-3.5 shrink-0 text-brand-amber" />
            <div className="leading-relaxed">
              <p>{schedule.start}</p>
              <p className="text-brand-gray">→ {schedule.end}</p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch lg:flex-row">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(announcement._id)}
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
              onToggle({ id: announcement._id, isActive: !announcement.isActive })
            }
            className="border-brand-amber/20"
          >
            {announcement.isActive ? (
              <>
                <PowerOff className="size-3.5" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="size-3.5" />
                Activate
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(announcement._id)}
          >
            <Trash2 className="size-3.5" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}

function CatalogSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-xl border border-brand-amber/10 bg-brand-cream/30"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}

export function AnnouncementCatalog({
  announcements,
  isLoading,
  onEdit,
  onToggle,
  onDelete,
  isToggling,
}) {
  const stats = useMemo(() => {
    const total = announcements.length;
    const active = announcements.filter((a) => a.isActive).length;
    const scheduled = announcements.filter((a) => a.startsAt || a.endsAt).length;
    return { total, active, scheduled };
  }, [announcements]);

  if (isLoading) {
    return <CatalogSkeleton />;
  }

  if (announcements.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-4 p-12 text-center animate-in fade-in zoom-in-95 duration-500">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-amber/15 text-brand-amber ring-1 ring-brand-amber/20">
          <Megaphone className="size-8" />
        </span>
        <div>
          <p className="text-lg font-bold">No announcements yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first storefront banner to welcome customers.
          </p>
        </div>
        <ButtonLink to="/admin/announcements/new">Create announcement</ButtonLink>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total", value: stats.total, icon: Megaphone },
          { label: "Active", value: stats.active, icon: Sparkles },
          { label: "Scheduled", value: stats.scheduled, icon: CalendarClock },
        ].map(({ label, value, icon: Icon }, i) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-3 rounded-xl border border-brand-amber/15 bg-brand-white/80 p-4 shadow-sm",
              "animate-in fade-in slide-in-from-top-2 [animation-fill-mode:both]"
            )}
            style={{ animationDelay: `${i * 80}ms`, animationDuration: "400ms" }}
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
        {announcements.map((announcement, index) => (
          <AnnouncementCard
            key={announcement._id}
            announcement={announcement}
            index={index}
            onEdit={onEdit}
            onToggle={onToggle}
            onDelete={onDelete}
            isToggling={isToggling}
          />
        ))}
      </div>
    </div>
  );
}
