import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge.jsx";
import { Button, ButtonLink } from "@/components/ui/button.jsx";
import { Card } from "@/components/ui/card.jsx";
import {
  SELLER_APPLICATION_TABS,
  SELLER_APPROVAL_STATUS_VARIANT,
} from "@/constants/sellerApproval.js";
import {
  ArrowRight,
  Mail,
  Sparkles,
  Store,
} from "lucide-react";

function SellerCard({ seller, index, activeTab }) {
  const ownerLabel = seller.user?.email || seller.user?.name || "—";
  const status = seller.approvalStatus || activeTab;
  const variant = SELLER_APPROVAL_STATUS_VARIANT[status] || "secondary";

  return (
    <Card
      className="group/seller relative overflow-hidden border-brand-amber/20 p-0 transition-all duration-500 hover:-translate-y-0.5 hover:border-brand-amber/35 hover:shadow-lg hover:shadow-brand-amber/10 animate-in fade-in slide-in-from-bottom-3 [animation-fill-mode:both]"
      style={{ animationDelay: `${index * 70}ms`, animationDuration: "400ms" }}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-brand-amber/10 blur-2xl transition-opacity group-hover/seller:opacity-80" />

      <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-cream via-brand-white to-brand-cream text-brand-amber shadow-sm ring-1 ring-brand-amber/20 transition-transform duration-300 group-hover/seller:scale-105">
            <Store className="size-5" />
          </span>
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-bold tracking-tight text-foreground">
                {seller.storeName || "Unnamed store"}
              </h3>
              <Badge variant={variant}>{status}</Badge>
            </div>
            <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
              <Mail className="size-3.5 shrink-0 text-brand-amber" />
              {ownerLabel}
            </p>
          </div>
        </div>

        <ButtonLink
          to={`/admin/seller/${seller._id}`}
          size="sm"
          variant="outline"
          className="shrink-0 gap-1.5 border-brand-amber/25 bg-brand-white shadow-sm transition-all group-hover/seller:border-brand-amber/40 group-hover/seller:bg-brand-cream"
        >
          View
          <ArrowRight className="size-3.5 transition-transform group-hover/seller:translate-x-0.5" />
        </ButtonLink>
      </div>
    </Card>
  );
}

function CatalogSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-xl border border-brand-amber/10 bg-brand-cream/30"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}

export function SellerApplicationsCatalog({
  sellers,
  isLoading,
  activeTab,
  onTabChange,
}) {
  const activeMeta = SELLER_APPLICATION_TABS.find((t) => t.id === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gray">
            <Sparkles className="size-3.5 text-brand-amber" />
            Seller onboarding
          </p>
          <p className="text-sm text-muted-foreground">
            Review store applications and manage seller access to the marketplace.
          </p>
        </div>
        {!isLoading && (
          <div className="flex items-center gap-2 rounded-xl border border-brand-amber/15 bg-brand-white/80 px-4 py-2 shadow-sm">
            <span className="text-2xl font-black text-foreground">{sellers.length}</span>
            <span className="text-xs leading-tight text-brand-gray">
              {activeTab.toLowerCase()}
              <br />
              application{sellers.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {SELLER_APPLICATION_TABS.map(({ id, icon: Icon, description }) => (
          <Button
            key={id}
            type="button"
            variant={activeTab === id ? "default" : "outline"}
            size="sm"
            onClick={() => onTabChange(id)}
            className={cn(
              "gap-1.5 transition-all",
              activeTab === id
                ? "shadow-md shadow-brand-amber/20"
                : "border-brand-amber/20 bg-brand-white hover:bg-brand-cream"
            )}
          >
            <Icon className="size-3.5" />
            {id}
          </Button>
        ))}
      </div>

      {activeMeta && (
        <p className="text-xs text-muted-foreground animate-in fade-in duration-300">
          {activeMeta.description}
        </p>
      )}

      {isLoading ? (
        <CatalogSkeleton />
      ) : sellers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 border-dashed border-brand-amber/25 bg-brand-cream/20 p-12 text-center animate-in fade-in zoom-in-95 duration-500">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-amber/15 text-brand-amber ring-1 ring-brand-amber/20">
            <Store className="size-7" />
          </span>
          <div>
            <p className="font-bold">No {activeTab.toLowerCase()} applications</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeTab === "Pending"
                ? "New seller sign-ups will appear here for review."
                : activeTab === "Approved"
                  ? "Approved sellers will be listed here."
                  : "Rejected applications will appear here."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {sellers.map((seller, index) => (
            <SellerCard
              key={seller._id}
              seller={seller}
              index={index}
              activeTab={activeTab}
            />
          ))}
        </div>
      )}
    </div>
  );
}
