import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge.jsx";
import { Button, ButtonLink } from "@/components/ui/button.jsx";
import { Card } from "@/components/ui/card.jsx";
import { formatCouponDate, formatDiscount } from "@/lib/couponUtils.js";
import {
  CalendarClock,
  Edit3,
  Percent,
  Power,
  PowerOff,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";

const ELIGIBILITY_LABELS = {
  all: "All users",
  new: "New users",
  returning: "Returning users",
};

function CouponCard({ coupon, index, onEdit, onToggle, isToggling }) {
  const discountLabel = formatDiscount(coupon);
  const isPercentage = coupon.discountType === "percentage";
  const usagePercent =
    coupon.usageLimit && coupon.usageLimit > 0
      ? Math.min(100, Math.round(((coupon.usedCount ?? 0) / coupon.usageLimit) * 100))
      : null;
  const eligibility =
    ELIGIBILITY_LABELS[coupon.eligibleUserType] ||
    ELIGIBILITY_LABELS.all;

  return (
    <Card
      className="group/coupon relative overflow-hidden border-brand-amber/25 p-0 transition-all duration-500 hover:-translate-y-1 hover:border-brand-amber/40 hover:shadow-xl hover:shadow-brand-amber/15 animate-in fade-in slide-in-from-bottom-4 [animation-fill-mode:both]"
      style={{ animationDelay: `${index * 80}ms`, animationDuration: "450ms" }}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand-amber/20 blur-3xl transition-opacity duration-500 group-hover/coupon:opacity-100" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-brand-amber/40 to-transparent" />

      <div className="relative flex flex-col sm:flex-row">
        {/* Ticket stub — discount hero */}
        <div className="relative flex shrink-0 flex-col items-center justify-center bg-gradient-to-br from-brand-amber via-amber-400 to-brand-amber px-6 py-6 text-foreground sm:w-44 sm:py-8">
          <div className="absolute inset-y-0 right-0 hidden w-px border-r border-dashed border-foreground/20 sm:block" />
          <div className="absolute -right-1.5 top-1/2 hidden size-3 -translate-y-1/2 rounded-full bg-brand-cream/80 ring-2 ring-brand-amber/30 sm:block" />
          <div className="absolute -right-1.5 top-8 hidden size-3 rounded-full bg-brand-cream/80 ring-2 ring-brand-amber/30 sm:block" />
          <div className="absolute -right-1.5 bottom-8 hidden size-3 rounded-full bg-brand-cream/80 ring-2 ring-brand-amber/30 sm:block" />

          <span className="flex size-10 items-center justify-center rounded-full bg-brand-white/25 ring-1 ring-brand-white/40">
            {isPercentage ? (
              <Percent className="size-5" />
            ) : (
              <span className="text-sm font-black">₹</span>
            )}
          </span>
          <p className="mt-3 text-4xl font-black leading-none tracking-tight">
            {isPercentage ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.25em] text-foreground/80">
            {isPercentage ? "Off" : "Flat off"}
          </p>
          {coupon.minOrderAmount > 0 && (
            <p className="mt-3 rounded-full bg-brand-white/30 px-2.5 py-0.5 text-[10px] font-semibold">
              Min ₹{coupon.minOrderAmount}
            </p>
          )}
        </div>

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full ring-2 ring-brand-white",
                      coupon.isActive
                        ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.45)]"
                        : "bg-brand-gray/40"
                    )}
                  />
                  <span className="inline-flex items-center gap-1.5 font-mono text-lg font-black tracking-widest text-foreground">
                    <Ticket className="size-4 text-brand-amber" />
                    {coupon.code}
                  </span>
                  <Badge variant={coupon.isActive ? "success" : "secondary"}>
                    {coupon.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {coupon.description && (
                  <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {coupon.description}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(coupon._id)}
                  className="border-brand-amber/25 bg-brand-white shadow-sm hover:bg-brand-cream"
                >
                  <Edit3 className="size-3.5" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant={coupon.isActive ? "destructive" : "outline"}
                  disabled={isToggling}
                  onClick={() => onToggle({ id: coupon._id, isActive: !coupon.isActive })}
                  className={cn(!coupon.isActive && "border-brand-amber/20")}
                >
                  {coupon.isActive ? (
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
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-cream/80 px-3 py-1 text-xs font-medium ring-1 ring-brand-amber/15">
                <Users className="size-3.5 text-brand-amber" />
                {eligibility}
              </span>
              <span className="rounded-full bg-brand-white px-3 py-1 text-xs font-medium ring-1 ring-brand-amber/10">
                {coupon.usedCount ?? 0}
                {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""} redemptions
              </span>
              <span className="rounded-full bg-brand-white px-3 py-1 text-xs font-medium ring-1 ring-brand-amber/10">
                {coupon.maxUsesPerUser ?? 1}× per user
              </span>
              <span className="rounded-full bg-brand-amber/15 px-3 py-1 text-xs font-semibold text-foreground ring-1 ring-brand-amber/20">
                {discountLabel}
              </span>
            </div>

            {usagePercent != null && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-medium uppercase tracking-wide text-brand-gray">
                  <span>Usage</span>
                  <span>{usagePercent}% claimed</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-brand-cream">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-amber to-amber-500 transition-all duration-700"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-auto flex items-center gap-2 rounded-xl border border-brand-amber/10 bg-gradient-to-r from-brand-cream/30 to-brand-white px-3 py-2.5">
              <CalendarClock className="size-4 shrink-0 text-brand-amber" />
              <div className="min-w-0 text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">
                  {formatCouponDate(coupon.startsAt)}
                </span>
                <span className="mx-1.5 text-brand-gray">→</span>
                <span className="font-medium text-foreground">
                  {formatCouponDate(coupon.endsAt)}
                </span>
              </div>
            </div>
          </div>
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
          className="h-44 animate-pulse rounded-xl border border-brand-amber/10 bg-brand-cream/30"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}

export function CouponCatalog({ coupons, isLoading, onEdit, onToggle, isToggling }) {
  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter((c) => c.isActive).length;
    const percentage = coupons.filter((c) => c.discountType === "percentage").length;
    return { total, active, percentage };
  }, [coupons]);

  if (isLoading) {
    return <CatalogSkeleton />;
  }

  if (coupons.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-4 p-12 text-center animate-in fade-in zoom-in-95 duration-500">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-amber/15 text-brand-amber ring-1 ring-brand-amber/20">
          <Ticket className="size-8" />
        </span>
        <div>
          <p className="text-lg font-bold">No coupons yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first platform coupon to offer discounts at checkout.
          </p>
        </div>
        <ButtonLink to="/admin/coupons/new">Create coupon</ButtonLink>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total coupons", value: stats.total, icon: Ticket },
          { label: "Active", value: stats.active, icon: Sparkles },
          { label: "Percentage", value: stats.percentage, icon: Percent },
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
        {coupons.map((coupon, index) => (
          <CouponCard
            key={coupon._id}
            coupon={coupon}
            index={index}
            onEdit={onEdit}
            onToggle={onToggle}
            isToggling={isToggling}
          />
        ))}
      </div>
    </div>
  );
}
