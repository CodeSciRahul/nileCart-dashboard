import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { getImageUrl } from "@/lib/storedImage.js";
import {
  AlertCircle,
  Clock,
  ImageIcon,
  Landmark,
  MapPin,
  Sparkles,
  Store,
  Type,
} from "lucide-react";

import { SELLER_APPROVAL_STATUS_VARIANT } from "@/constants/sellerApproval.js";

export function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-pulse">
      <div className="h-28 rounded-2xl border border-brand-amber/10 bg-brand-cream/30" />
      <div className="h-96 rounded-xl border border-brand-amber/10 bg-brand-cream/20" />
    </div>
  );
}

export function ProfileHero({ seller, logoUrl }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-amber/25 bg-gradient-to-br from-brand-cream/50 via-brand-white to-brand-cream/30 p-5 shadow-sm animate-in fade-in slide-in-from-top-3 duration-500">
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand-amber/15 blur-3xl" />

      <div className="relative flex items-start gap-4">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            className="size-16 shrink-0 rounded-2xl border-2 border-brand-white object-cover shadow-md ring-1 ring-brand-amber/20 transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-amber via-amber-400 to-brand-amber shadow-md ring-1 ring-brand-amber/30">
            <Store className="size-8 text-foreground" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gray">
            <Sparkles className="size-3 text-brand-amber" />
            Your storefront
          </p>
          <h2 className="truncate text-xl font-black tracking-tight">
            {seller?.storeName || "Store profile"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage how your store appears on the NileCart marketplace.
          </p>
          {seller && (
            <Badge
              variant={SELLER_APPROVAL_STATUS_VARIANT[seller.approvalStatus] || "secondary"}
              className="mt-2"
            >
              {seller.approvalStatus}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProfileAlert({ isRejected, isPending, rejectionReason }) {
  if (isRejected && rejectionReason) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 animate-in fade-in slide-in-from-top-2 duration-400">
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div>
          <p className="text-sm font-semibold text-destructive">Application rejected</p>
          <p className="mt-1 text-sm text-destructive/90">
            {rejectionReason}. Update your details below and resubmit for review.
          </p>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-brand-amber/25 bg-brand-cream/60 p-4 animate-in fade-in slide-in-from-top-2 duration-400">
        <Clock className="mt-0.5 size-5 shrink-0 text-brand-amber" />
        <div>
          <p className="text-sm font-semibold text-foreground">Under review</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your application is being reviewed. You can update details until approved.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export function FormSection({ id, title, description, icon: Icon, step, children, className }) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 overflow-hidden rounded-2xl border border-brand-amber/15 bg-brand-white/80 shadow-sm animate-in fade-in slide-in-from-bottom-3 [animation-fill-mode:both]",
        className
      )}
      style={{ animationDelay: `${(step - 1) * 80}ms`, animationDuration: "450ms" }}
    >
      <div className="flex items-start gap-3 border-b border-brand-amber/10 bg-gradient-to-r from-brand-cream/40 to-brand-white px-5 py-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-amber/15 text-sm font-black text-brand-amber ring-1 ring-brand-amber/15">
          {step}
        </span>
        <div>
          <div className="flex items-center gap-2">
            {Icon && <Icon className="size-4 text-brand-amber" />}
            <h3 className="font-bold tracking-tight text-foreground">{title}</h3>
          </div>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

export function BrandingPreview({ logo, banner, storeName, description }) {
  const logoUrl = getImageUrl(logo);
  const bannerUrl = getImageUrl(banner);

  return (
    <Card className="sticky top-20 overflow-hidden border-brand-amber/25 p-0 shadow-md animate-in fade-in slide-in-from-right-3 duration-500">
      <div className="border-b border-brand-amber/15 bg-gradient-to-br from-brand-amber/20 via-brand-cream to-brand-white px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gray">
          Storefront preview
        </p>
        <p className="text-sm font-bold">How shoppers see you</p>
      </div>
      <CardContent className="space-y-4 p-4">
        <div className="overflow-hidden rounded-xl border border-brand-amber/15 shadow-sm">
          {bannerUrl ? (
            <img src={bannerUrl} alt="" className="h-24 w-full object-cover" />
          ) : (
            <div className="flex h-24 items-center justify-center bg-gradient-to-br from-brand-cream to-brand-amber/30">
              <ImageIcon className="size-8 text-brand-amber/50" />
            </div>
          )}
          <div className="flex items-center gap-3 bg-brand-white p-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                className="size-12 rounded-xl border-2 border-brand-white object-cover shadow-md ring-1 ring-brand-amber/20"
              />
            ) : (
              <span className="flex size-12 items-center justify-center rounded-xl bg-brand-cream ring-1 ring-brand-amber/15">
                <Store className="size-5 text-brand-amber" />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-bold">{storeName || "Your store"}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {description || "Add a description to tell customers about your store."}
              </p>
            </div>
          </div>
        </div>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Logo and banner appear on your public store page after approval.
        </p>
      </CardContent>
    </Card>
  );
}
