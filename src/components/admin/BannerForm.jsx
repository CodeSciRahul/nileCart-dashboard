import { useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { ImageUpload } from "@/components/upload/ImageUpload.jsx";
import { UPLOAD_FOLDERS } from "@/constants/uploads.js";
import { BANNER_TYPES } from "@/constants/marketing.js";
import {
  DeepLinkFields,
  TargetingFields,
  selectClass,
} from "@/components/admin/MarketingFields.jsx";
import { cn } from "@/lib/utils";
import { CircleHelp, ImageIcon, Monitor, Smartphone, Sparkles } from "lucide-react";

function FormSection({ title, description, children }) {
  return (
    <section className="space-y-4">
      <div className="space-y-1 border-b border-brand-amber/10 pb-3">
        <h3 className="text-sm font-bold tracking-tight text-foreground">{title}</h3>
        {description && (
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

function BannerPreview({ form, mode }) {
  const image =
    mode === "mobile"
      ? form.mobileImage?.url || form.image?.url
      : form.image?.url;

  if (!image && !form.title) {
    return (
      <div className="rounded-xl border border-dashed border-brand-amber/25 bg-brand-cream/30 px-4 py-10 text-center text-xs text-muted-foreground">
        Live preview appears as you add content
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-brand-cream ring-1 ring-black/5",
        mode === "mobile" ? "aspect-[9/16] max-w-[220px] mx-auto" : "aspect-[21/9]"
      )}
    >
      {image ? (
        <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-cream to-brand-amber/20" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-center p-4 sm:p-6">
        {form.subtitle && (
          <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-amber sm:text-xs">
            {form.subtitle}
          </p>
        )}
        <h4 className="mt-1 text-base font-black text-white sm:text-xl">
          {form.title || "Banner title"}
        </h4>
        {form.description && (
          <p className="mt-1 line-clamp-2 text-xs text-white/85">{form.description}</p>
        )}
        <span className="mt-3 inline-flex w-fit rounded-full bg-brand-amber px-3 py-1 text-[10px] font-bold text-foreground">
          {form.ctaText || "Shop Now"}
        </span>
      </div>
    </div>
  );
}

export function BannerForm({
  form,
  setForm,
  isEdit,
  onSubmit,
  onCancel,
  isPending,
  onOpenGuide,
}) {
  const [previewMode, setPreviewMode] = useState("desktop");

  return (
    <Card className="w-full overflow-hidden border-brand-amber/25 p-0 shadow-md">
      <CardHeader className="border-b border-brand-amber/15 bg-gradient-to-br from-brand-cream/60 via-brand-white to-brand-cream/30 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-amber via-amber-400 to-brand-amber text-foreground shadow-md shadow-brand-amber/20 ring-1 ring-brand-amber/30">
              <ImageIcon className="size-6" />
            </span>
            <div className="min-w-0 pt-0.5">
              <CardTitle className="text-xl font-black tracking-tight">
                {isEdit ? "Edit banner" : "Create banner"}
              </CardTitle>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Schedule, target, and publish hero or promotional banners without redeploying.
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
              <CircleHelp className="size-4 text-brand-amber" />
              <span className="hidden sm:inline">Guide</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-6 py-6">
        <form onSubmit={onSubmit} className="space-y-8">
          <FormSection title="Content" description="Copy and type shown on the storefront.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Type">
                <select
                  className={selectClass}
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  {BANNER_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Title *">
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </Field>
            </div>
            <Field label="Subtitle">
              <Input
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              />
            </Field>
            <Field label="Description">
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="min-h-20"
              />
            </Field>
          </FormSection>

          <FormSection title="Images" description="Desktop image is required; mobile is optional.">
            <div className="grid gap-4 md:grid-cols-2">
              <ImageUpload
                label="Desktop image *"
                folder={UPLOAD_FOLDERS.PLATFORM_BANNERS}
                value={form.image}
                onChange={(image) => setForm((f) => ({ ...f, image }))}
              />
              <ImageUpload
                label="Mobile image"
                folder={UPLOAD_FOLDERS.PLATFORM_BANNERS}
                value={form.mobileImage}
                onChange={(mobileImage) => setForm((f) => ({ ...f, mobileImage }))}
              />
            </div>
          </FormSection>

          <FormSection title="Call to action" description="Button label and destination.">
            <Field label="CTA text">
              <Input
                value={form.ctaText}
                onChange={(e) => setForm((f) => ({ ...f, ctaText: e.target.value }))}
              />
            </Field>
            <DeepLinkFields
              value={form.deepLink}
              onChange={(deepLink) => setForm((f) => ({ ...f, deepLink }))}
            />
            <Field label="Legacy CTA URL" hint="Optional fallback URL if deep link is empty.">
              <Input
                value={form.ctaLink}
                onChange={(e) => setForm((f) => ({ ...f, ctaLink: e.target.value }))}
                placeholder="/sale or https://..."
              />
            </Field>
          </FormSection>

          <FormSection title="Schedule & order">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Display order" hint="Lower numbers appear first.">
                <Input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, displayOrder: e.target.value }))
                  }
                />
              </Field>
              <Field label="Priority" hint="Higher priority wins ties.">
                <Input
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                />
              </Field>
              <Field label="Starts at">
                <Input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                />
              </Field>
              <Field label="Ends at">
                <Input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Targeting" description="Control who sees this banner.">
            <TargetingFields
              value={form.targeting}
              onChange={(targeting) => setForm((f) => ({ ...f, targeting }))}
            />
          </FormSection>

          <FormSection title="Preview">
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={previewMode === "desktop" ? "default" : "outline"}
                onClick={() => setPreviewMode("desktop")}
                className="gap-1.5"
              >
                <Monitor className="size-3.5" />
                Desktop
              </Button>
              <Button
                type="button"
                size="sm"
                variant={previewMode === "mobile" ? "default" : "outline"}
                onClick={() => setPreviewMode("mobile")}
                className="gap-1.5"
              >
                <Smartphone className="size-3.5" />
                Mobile
              </Button>
            </div>
            <BannerPreview form={form} mode={previewMode} />
          </FormSection>

          <FormSection title="Status">
            <label className="flex w-full max-w-sm cursor-pointer items-center gap-3 rounded-xl border border-brand-amber/15 bg-brand-cream/30 px-4 py-3 transition-colors hover:bg-brand-cream/50">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="size-4 accent-brand-amber"
              />
              <span className="text-sm font-medium">Published (active)</span>
            </label>
          </FormSection>

          <div className="flex flex-col-reverse gap-2 border-t border-brand-amber/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Changes go live on the storefront after the next cache refresh (~60s).
            </p>
            <div className="flex gap-2">
              {isEdit && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isPending} className="min-w-[120px] gap-1.5">
                <Sparkles className="size-3.5" />
                {isPending ? "Saving..." : isEdit ? "Update" : "Publish"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
