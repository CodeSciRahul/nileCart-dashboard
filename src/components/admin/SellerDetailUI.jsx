import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge.jsx";
import { ButtonLink } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { getImageUrl } from "@/lib/storedImage.js";
import {
  ArrowLeft,
  Building2,
  Calendar,
  ExternalLink,
  FileText,
  Landmark,
  MapPin,
  Percent,
  Sparkles,
  Store,
  User,
} from "lucide-react";

import { SELLER_APPROVAL_STATUS_VARIANT } from "@/constants/sellerApproval.js";

export function SellerDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 rounded-2xl border border-brand-amber/10 bg-brand-cream/30" />
      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 rounded-xl border border-brand-amber/10 bg-brand-cream/20"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SellerDetailHero({ seller, isApproved }) {
  const logoUrl = getImageUrl(seller.logo);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-amber/25 bg-gradient-to-br from-brand-cream/50 via-brand-white to-brand-cream/30 p-5 shadow-sm animate-in fade-in slide-in-from-top-3 duration-500">
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand-amber/15 blur-3xl" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="size-16 shrink-0 rounded-2xl border-2 border-brand-white object-cover shadow-md ring-1 ring-brand-amber/20"
            />
          ) : (
            <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-amber via-amber-400 to-brand-amber shadow-md ring-1 ring-brand-amber/30">
              <Store className="size-8 text-foreground" />
            </span>
          )}
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gray">
              <Sparkles className="size-3 text-brand-amber" />
              Seller profile
            </p>
            <h2 className="truncate text-xl font-black tracking-tight">{seller.storeName}</h2>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {seller.user?.email}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant={SELLER_APPROVAL_STATUS_VARIANT[seller.approvalStatus] || "secondary"}>
                {seller.approvalStatus}
              </Badge>
              {isApproved && (
                <Badge variant={seller.isActive ? "success" : "destructive"}>
                  {seller.isActive ? "Active" : "Inactive"}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <ButtonLink
          to="/admin/sellers"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 border-brand-amber/25 bg-brand-white hover:bg-brand-cream"
        >
          <ArrowLeft className="size-4" />
          Back to sellers
        </ButtonLink>
      </div>
    </div>
  );
}

function DetailSection({ title, icon: Icon, children, index = 0, className }) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-brand-amber/20 p-0 shadow-sm transition-shadow hover:shadow-md animate-in fade-in slide-in-from-bottom-3 [animation-fill-mode:both]",
        className
      )}
      style={{ animationDelay: `${index * 80}ms`, animationDuration: "450ms" }}
    >
      <CardHeader className="border-b border-brand-amber/10 bg-gradient-to-r from-brand-cream/40 to-brand-white px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-amber/15 text-brand-amber ring-1 ring-brand-amber/15">
            <Icon className="size-4" />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-5">{children}</CardContent>
    </Card>
  );
}

export function InfoRow({ label, value, icon: Icon }) {
  if (!value) return null;

  return (
    <div className="flex gap-3 rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-brand-amber/10 hover:bg-brand-cream/30">
      {Icon && (
        <Icon className="mt-0.5 size-4 shrink-0 text-brand-amber" aria-hidden />
      )}
      <div className="min-w-0 flex-1 grid gap-0.5 sm:grid-cols-3 sm:gap-2">
        <dt className="text-xs font-medium uppercase tracking-wide text-brand-gray">{label}</dt>
        <dd className="sm:col-span-2 text-sm font-medium text-foreground">{value}</dd>
      </div>
    </div>
  );
}

export function DocumentCard({ label, image, index }) {
  const url = getImageUrl(image);
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group/doc flex flex-col gap-2 rounded-xl border border-brand-amber/15 bg-brand-cream/20 p-4 transition-all hover:border-brand-amber/30 hover:bg-brand-cream/40 hover:shadow-sm animate-in fade-in zoom-in-95 [animation-fill-mode:both]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm font-semibold">
          <FileText className="size-4 text-brand-amber" />
          {label}
        </p>
        <ExternalLink className="size-3.5 text-brand-gray transition-transform group-hover/doc:translate-x-0.5 group-hover/doc:-translate-y-0.5" />
      </div>
      <span className="text-xs font-medium text-brand-amber group-hover/doc:underline">
        View document
      </span>
    </a>
  );
}

export function SellerDetailGrid({ seller, documents }) {
  const logoUrl = getImageUrl(seller.logo);
  const bannerUrl = getImageUrl(seller.banner);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DetailSection title="Store" icon={Store} index={0}>
        <InfoRow label="Store name" value={seller.storeName} icon={Store} />
        <InfoRow label="Store slug" value={seller.storeSlug} />
        <InfoRow label="Description" value={seller.description} />
        <InfoRow label="TIN number" value={seller.tinNumber} icon={Building2} />
        <InfoRow label="National ID" value={seller.nationalId} />
        <InfoRow
          label="Commission rate"
          value={seller.commissionRate != null ? `${seller.commissionRate}%` : undefined}
          icon={Percent}
        />
        <InfoRow
          label="Applied on"
          value={seller.createdAt ? new Date(seller.createdAt).toLocaleString() : undefined}
          icon={Calendar}
        />
      </DetailSection>

      <DetailSection title="Owner" icon={User} index={1}>
        <InfoRow label="Name" value={seller.user?.name} icon={User} />
        <InfoRow label="Email" value={seller.user?.email} />
        <InfoRow label="Mobile" value={seller.user?.mobileNumber} />
        <InfoRow label="Role" value={seller.user?.role} />
      </DetailSection>

      <DetailSection title="Address" icon={MapPin} index={2}>
        <InfoRow label="Address line" value={seller.address?.addressLine} icon={MapPin} />
        <InfoRow label="City" value={seller.address?.city} />
        <InfoRow label="State" value={seller.address?.state} />
        <InfoRow label="Country" value={seller.address?.country} />
        <InfoRow label="Pincode" value={seller.address?.pincode} />
      </DetailSection>

      <DetailSection title="Bank details" icon={Landmark} index={3}>
        <InfoRow
          label="Account holder"
          value={seller.bankDetails?.accountHolderName}
          icon={Landmark}
        />
        <InfoRow label="Account number" value={seller.bankDetails?.accountNumber} />
        <InfoRow label="IFSC code" value={seller.bankDetails?.ifscCode} />
      </DetailSection>

      <DetailSection title="Branding" icon={Sparkles} index={4} className="lg:col-span-2">
        <div className="flex flex-wrap gap-6">
          {logoUrl && (
            <div className="space-y-2 animate-in fade-in duration-500">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-gray">Logo</p>
              <img
                src={logoUrl}
                alt="Store logo"
                className="size-28 rounded-2xl border-2 border-brand-white object-cover shadow-lg ring-1 ring-brand-amber/20 transition-transform hover:scale-105"
              />
            </div>
          )}
          {bannerUrl && (
            <div className="min-w-0 flex-1 space-y-2 animate-in fade-in duration-500">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-gray">Banner</p>
              <img
                src={bannerUrl}
                alt="Store banner"
                className="h-32 w-full max-w-lg rounded-2xl border-2 border-brand-white object-cover shadow-lg ring-1 ring-brand-amber/20 transition-transform hover:scale-[1.02]"
              />
            </div>
          )}
          {!logoUrl && !bannerUrl && (
            <p className="text-sm text-muted-foreground">No branding assets uploaded.</p>
          )}
        </div>
      </DetailSection>

      <DetailSection
        title="Verification documents"
        icon={FileText}
        index={5}
        className="lg:col-span-2"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries({
            idProof: "Government ID proof",
            businessProof: "Business proof",
            addressProof: "Address proof",
          }).map(([key, label], i) => (
            <DocumentCard key={key} label={label} image={documents[key]} index={i} />
          ))}
        </div>
      </DetailSection>
    </div>
  );
}

export function SellerNotFound() {
  return (
    <Card className="flex flex-col items-center gap-4 border-dashed border-brand-amber/25 p-12 text-center">
      <Store className="size-12 text-brand-gray" />
      <p className="text-muted-foreground">Seller not found.</p>
      <ButtonLink to="/admin/sellers" variant="outline">
        Back to sellers
      </ButtonLink>
    </Card>
  );
}
