import { cn } from "@/lib/utils";
import { PRODUCT_GENDER_OPTIONS } from "@/constants/productForm.js";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { getImageUrl } from "@/lib/storedImage.js";
import { getVariantPriceRange } from "@/lib/productUtils.js";
import {
  BookOpen,
  ImageIcon,
  Package,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";

export function ProductFormSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-pulse">
      <div className="h-24 rounded-2xl border border-brand-amber/10 bg-brand-cream/30" />
      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        <div className="h-[600px] rounded-xl border border-brand-amber/10 bg-brand-cream/20" />
        <div className="hidden h-80 rounded-xl border border-brand-amber/10 bg-brand-cream/20 xl:block" />
      </div>
    </div>
  );
}

export function ProductFormHero({ isEdit, title, onOpenGuide }) {
  return (
    <div className="relative flex-1 overflow-hidden rounded-2xl border border-brand-amber/25 bg-gradient-to-br from-brand-cream/50 via-brand-white to-brand-cream/30 p-5 shadow-sm animate-in fade-in slide-in-from-top-3 duration-500">
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand-amber/15 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-amber via-amber-400 to-brand-amber shadow-md ring-1 ring-brand-amber/30">
            <Package className="size-7 text-foreground" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gray">
              <Sparkles className="size-3 text-brand-amber" />
              {isEdit ? "Update listing" : "New listing"}
            </p>
            <h2 className="truncate text-xl font-black tracking-tight">
              {title || (isEdit ? "Edit product" : "Create product")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEdit
                ? "Update details, images, and variants for this product."
                : "Add product details, images, and at least one variant to list on NileCart."}
            </p>
          </div>
        </div>
        {onOpenGuide && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenGuide}
            className="shrink-0 gap-1.5 border-brand-amber/25 bg-brand-white shadow-sm hover:bg-brand-cream"
          >
            <BookOpen className="size-4 text-brand-amber" />
            <span className="hidden sm:inline">Full guide</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export function FormSection({ title, description, icon: Icon, step, children, className, action }) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-brand-amber/15 bg-brand-white/80 shadow-sm animate-in fade-in slide-in-from-bottom-3 [animation-fill-mode:both]",
        className
      )}
      style={{ animationDelay: `${(step - 1) * 80}ms`, animationDuration: "450ms" }}
    >
      <div className="flex items-start justify-between gap-3 border-b border-brand-amber/10 bg-gradient-to-r from-brand-cream/40 to-brand-white px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-amber/15 text-sm font-black text-brand-amber ring-1 ring-brand-amber/15">
            {step}
          </span>
          <div>
            <div className="flex items-center gap-2">
              {Icon && <Icon className="size-4 text-brand-amber" />}
              <h3 className="font-bold tracking-tight text-foreground">{title}</h3>
            </div>
            {description && (
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

export function Field({ label, hint, children, required }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {hint && <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function GenderPills({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRODUCT_GENDER_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
            value === opt.value
              ? "border-brand-amber bg-brand-amber/20 text-foreground shadow-sm ring-1 ring-brand-amber/30"
              : "border-brand-amber/20 bg-brand-white text-muted-foreground hover:border-brand-amber/40 hover:bg-brand-cream/50"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function TagsInput({ tags, tagInput, onTagInputChange, onAddTag, onRemoveTag, onKeyDown }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-amber/60" />
          <Input
            value={tagInput}
            onChange={(e) => onTagInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="e.g. summer, cotton, casual"
            className="pl-9"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => onAddTag(tagInput)}
          disabled={!tagInput.trim()}
          className="shrink-0 border-brand-amber/25"
        >
          <Plus className="mr-1 size-4" />
          Add
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Press Enter or click Add. Tags help with search and filtering.
      </p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-brand-amber/15 bg-brand-cream/30 p-3">
          {tags.map((tag, index) => (
            <Badge
              key={`${tag}-${index}`}
              variant="secondary"
              className="gap-1 border-brand-amber/15 bg-brand-white pr-1"
            >
              {tag}
              <button
                type="button"
                className="rounded-sm p-0.5 transition-colors hover:bg-brand-cream"
                onClick={() => onRemoveTag(index)}
                aria-label={`Remove ${tag}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function discountPercent(price, mrp) {
  const p = Number(price);
  const m = Number(mrp);
  if (!p || !m || m <= p) return null;
  return Math.round(((m - p) / m) * 100);
}

export function VariantCard({
  variant,
  index,
  canRemove,
  onRemove,
  children,
}) {
  const discount = discountPercent(variant.price, variant.mrp);
  const variantLabel = [variant.size, variant.color].filter(Boolean).join(" · ") || `Variant ${index + 1}`;

  return (
    <div
      className="overflow-hidden rounded-xl border border-brand-amber/20 bg-gradient-to-br from-brand-cream/30 to-brand-white shadow-sm transition-shadow duration-200 hover:shadow-md animate-in fade-in slide-in-from-left-2 [animation-fill-mode:both]"
      style={{ animationDelay: `${index * 60}ms`, animationDuration: "350ms" }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-brand-amber/10 bg-brand-cream/40 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-amber/15 text-xs font-black text-brand-amber">
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{variantLabel}</p>
            {variant.sku && (
              <p className="truncate font-mono text-[10px] text-muted-foreground">{variant.sku}</p>
            )}
          </div>
          {discount != null && (
            <Badge variant="success" className="shrink-0 text-[10px]">
              {discount}% off
            </Badge>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
        >
          <Trash2 className="mr-1 size-4" />
          Remove
        </Button>
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </div>
  );
}

export function ProductPreviewPanel({ form, categoryLabel }) {
  const coverUrl = getImageUrl(form.images?.[0]);
  const priceRange = getVariantPriceRange(form.variants);
  const totalStock = form.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

  return (
    <Card className="sticky top-20 overflow-hidden border-brand-amber/25 p-0 shadow-md animate-in fade-in slide-in-from-right-3 duration-500">
      <div className="border-b border-brand-amber/15 bg-gradient-to-br from-brand-amber/20 via-brand-cream to-brand-white px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gray">
          Live preview
        </p>
        <p className="text-sm font-bold">Product card</p>
      </div>
      <CardContent className="space-y-4 p-4">
        <div className="overflow-hidden rounded-xl border border-brand-amber/15 shadow-sm">
          {coverUrl ? (
            <img src={coverUrl} alt="" className="aspect-square w-full object-cover" />
          ) : (
            <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-brand-cream to-brand-amber/20">
              <ImageIcon className="size-10 text-brand-amber/40" />
            </div>
          )}
          <div className="space-y-2 bg-brand-white p-3">
            {categoryLabel && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-gray">
                {categoryLabel}
              </p>
            )}
            <p className="line-clamp-2 font-bold leading-snug">
              {form.title || "Product title"}
            </p>
            {priceRange ? (
              <p className="text-lg font-black text-foreground">{priceRange}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Set variant prices</p>
            )}
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {form.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-brand-cream px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
                {form.tags.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">+{form.tags.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg border border-brand-amber/15 bg-brand-cream/30 px-2 py-2">
            <p className="text-lg font-black">{form.variants.length}</p>
            <p className="text-[10px] text-muted-foreground">Variant{form.variants.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="rounded-lg border border-brand-amber/15 bg-brand-cream/30 px-2 py-2">
            <p className="text-lg font-black">{totalStock}</p>
            <p className="text-[10px] text-muted-foreground">Total stock</p>
          </div>
        </div>

        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Preview updates as you fill in details. Shoppers see the live listing after you save.
        </p>
      </CardContent>
    </Card>
  );
}
