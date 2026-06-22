import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { CategoryTreePicker } from "@/components/admin/CategoryTreePicker.jsx";
import {
  COUPON_ELIGIBILITY_OPTIONS,
  COUPON_FORM_SECTIONS,
} from "@/constants/couponForm.js";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  CalendarClock,
  CircleHelp,
  Layers,
  Percent,
  RefreshCcw,
  Search,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";

function FormSection({ id, title, description, icon: Icon, step, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-6 overflow-hidden rounded-2xl border border-brand-amber/15 bg-brand-white/80 shadow-sm"
    >
      <div className="flex items-start gap-3 border-b border-brand-amber/10 bg-gradient-to-r from-brand-cream/50 via-brand-white to-brand-cream/30 px-5 py-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-amber/15 text-sm font-black text-brand-amber ring-1 ring-brand-amber/20">
          {step}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="size-4 text-brand-amber" />}
            <h3 className="font-bold tracking-tight text-foreground">{title}</h3>
          </div>
          {description && (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

function Field({ label, hint, children, htmlFor }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

function CouponSummaryPanel({ form, selectedProducts, isEdit }) {
  const hasDiscount = form.code && form.discountValue;
  const scopeParts = [];
  if (form.applicableCategories?.length) {
    scopeParts.push(`${form.applicableCategories.length} categor${form.applicableCategories.length === 1 ? "y" : "ies"}`);
  }
  if (selectedProducts.length) {
    scopeParts.push(`${selectedProducts.length} product${selectedProducts.length === 1 ? "" : "s"}`);
  }
  const scopeLabel = scopeParts.length ? scopeParts.join(", ") : "All catalog items";

  return (
    <Card className="sticky top-20 overflow-hidden border-brand-amber/25 p-0 shadow-md">
      <div className="border-b border-brand-amber/15 bg-gradient-to-br from-brand-amber/20 via-brand-cream to-brand-white px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gray">
          Live preview
        </p>
        <p className="text-sm font-bold">Checkout summary</p>
      </div>
      <CardContent className="space-y-4 p-4">
        {hasDiscount ? (
          <div className="rounded-xl bg-gradient-to-br from-brand-amber via-amber-400 to-brand-amber p-4 text-center shadow-md shadow-brand-amber/20">
            <p className="font-mono text-lg font-black tracking-widest text-foreground">
              {form.code}
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground/90">
              {form.discountType === "percentage"
                ? `${form.discountValue}% off`
                : `₹${form.discountValue} off`}
            </p>
            {Number(form.minOrderAmount) > 0 && (
              <p className="mt-2 text-xs text-foreground/80">
                Min order ₹{form.minOrderAmount}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-brand-amber/30 bg-brand-cream/30 px-4 py-8 text-center text-xs text-muted-foreground">
            Enter a code and discount to see preview
          </div>
        )}

        <dl className="space-y-2 text-xs">
          <div className="flex justify-between gap-2 border-b border-brand-amber/10 pb-2">
            <dt className="text-brand-gray">Eligibility</dt>
            <dd className="font-medium capitalize">{form.eligibleUserType}</dd>
          </div>
          <div className="flex justify-between gap-2 border-b border-brand-amber/10 pb-2">
            <dt className="text-brand-gray">Scope</dt>
            <dd className="max-w-[140px] truncate text-right font-medium">{scopeLabel}</dd>
          </div>
          <div className="flex justify-between gap-2 border-b border-brand-amber/10 pb-2">
            <dt className="text-brand-gray">Per user</dt>
            <dd className="font-medium">{form.maxUsesPerUser || 1} use(s)</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-brand-gray">Global limit</dt>
            <dd className="font-medium">{form.usageLimit || "Unlimited"}</dd>
          </div>
        </dl>

        {isEdit && (
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Coupon code cannot be changed after creation.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function CouponForm({
  form,
  setForm,
  editId,
  categoryTree,
  productQuery,
  setProductQuery,
  productResults,
  selectedProducts,
  onAddProduct,
  onRemoveProduct,
  onSubmit,
  onCancel,
  isPending,
  onOpenGuide,
}) {
  const isEdit = Boolean(editId);

  return (
    <Card className="w-full overflow-hidden border-brand-amber/25 p-0 shadow-md">
      <CardHeader className="border-b border-brand-amber/15 bg-gradient-to-br from-brand-cream/60 via-brand-white to-brand-cream/30 px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-amber via-amber-400 to-brand-amber text-foreground shadow-md shadow-brand-amber/20 ring-1 ring-brand-amber/30">
              <Ticket className="size-6" />
            </span>
            <div className="min-w-0 pt-0.5">
              <CardTitle className="text-xl font-black tracking-tight">
                {isEdit ? "Edit coupon" : "Create coupon"}
              </CardTitle>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {isEdit
                  ? "Update discount rules, scope, and schedule for this coupon."
                  : "Set up a platform coupon for customers to use at checkout."}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {COUPON_FORM_SECTIONS.map(({ title, step }) => (
                  <a
                    key={title}
                    href={`#section-${step}`}
                    className="rounded-full bg-brand-cream/80 px-2.5 py-0.5 text-[10px] font-semibold text-brand-gray ring-1 ring-brand-amber/10 transition-colors hover:bg-brand-amber/20 hover:text-foreground"
                  >
                    {step}. {title}
                  </a>
                ))}
              </div>
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
              <BookOpen className="size-3.5 text-brand-gray" />
              <span className="hidden sm:inline">Full guide</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-4 py-6 sm:px-6">
        <form onSubmit={onSubmit}>
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
            <div className="xl:hidden">
              <CouponSummaryPanel
                form={form}
                selectedProducts={selectedProducts}
                isEdit={isEdit}
              />
            </div>
            <div className="space-y-6">
              <FormSection
                id="section-1"
                step={1}
                icon={Ticket}
                title="Basic details"
                description="The coupon code customers enter at checkout. Use something short and memorable."
              >
                <Field
                  label="Code *"
                  htmlFor="code"
                  hint={isEdit ? "Code is locked after creation." : "Auto-converted to uppercase. No spaces."}
                >
                  <Input
                    id="code"
                    value={form.code}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                    }
                    placeholder="NILECART20"
                    required
                    disabled={isEdit}
                    className="font-mono text-base uppercase tracking-widest"
                  />
                </Field>
                <Field
                  label="Description"
                  htmlFor="description"
                  hint="Internal note — helps your team remember what this coupon is for."
                >
                  <Input
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="20% off on orders above ₹999"
                  />
                </Field>
              </FormSection>

              <FormSection
                id="section-2"
                step={2}
                icon={Percent}
                title="Discount rules"
                description="Choose how much the customer saves and any conditions."
              >
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "percentage", label: "Percentage off" },
                    { value: "flat", label: "Flat amount (₹)" },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, discountType: value }))}
                      className={cn(
                        "rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                        form.discountType === value
                          ? "border-brand-amber bg-brand-amber text-foreground shadow-sm ring-1 ring-brand-amber/30"
                          : "border-brand-amber/20 bg-brand-white text-muted-foreground hover:border-brand-amber/40 hover:bg-brand-cream/50"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label={form.discountType === "percentage" ? "Discount % *" : "Discount amount (₹) *"}
                    htmlFor="discountValue"
                  >
                    <Input
                      id="discountValue"
                      type="number"
                      min="0"
                      step="any"
                      value={form.discountValue}
                      onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                      placeholder={form.discountType === "percentage" ? "20" : "500"}
                      required
                    />
                  </Field>
                  <Field label="Min order amount (₹)" htmlFor="minOrderAmount" hint="0 = no minimum.">
                    <Input
                      id="minOrderAmount"
                      type="number"
                      min="0"
                      value={form.minOrderAmount}
                      onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
                    />
                  </Field>
                  {form.discountType === "percentage" && (
                    <Field
                      label="Max discount cap (₹)"
                      htmlFor="maxDiscount"
                      hint="Optional ceiling on how much a % discount can save."
                    >
                      <Input
                        id="maxDiscount"
                        type="number"
                        min="0"
                        value={form.maxDiscount}
                        onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
                        placeholder="e.g. 500"
                      />
                    </Field>
                  )}
                </div>
              </FormSection>

              <FormSection
                id="section-3"
                step={3}
                icon={RefreshCcw}
                title="Usage limits"
                description="Prevent abuse by capping how often the coupon can be redeemed."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Global usage limit"
                    htmlFor="usageLimit"
                    hint="Total redemptions across all customers. Empty = unlimited."
                  >
                    <Input
                      id="usageLimit"
                      type="number"
                      min="1"
                      value={form.usageLimit}
                      onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                      placeholder="Unlimited"
                    />
                  </Field>
                  <Field label="Max uses per user *" htmlFor="maxUsesPerUser">
                    <Input
                      id="maxUsesPerUser"
                      type="number"
                      min="1"
                      value={form.maxUsesPerUser}
                      onChange={(e) => setForm((f) => ({ ...f, maxUsesPerUser: e.target.value }))}
                    />
                  </Field>
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-amber/15 bg-brand-cream/30 p-4 transition-colors hover:bg-brand-cream/50">
                  <input
                    id="restoreOnCancel"
                    type="checkbox"
                    checked={form.restoreOnCancel}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, restoreOnCancel: e.target.checked }))
                    }
                    className="mt-0.5 size-4 accent-brand-amber"
                  />
                  <div>
                    <span className="text-sm font-medium">Restore coupon if order is cancelled</span>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Returns one use to the customer&apos;s limit when they cancel an order that
                      used this code.
                    </p>
                  </div>
                </label>
              </FormSection>

              <FormSection
                id="section-4"
                step={4}
                icon={Users}
                title="User eligibility"
                description="Target specific customer segments for this promotion."
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  {COUPON_ELIGIBILITY_OPTIONS.map(({ value, label, description }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, eligibleUserType: value }))}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-all",
                        form.eligibleUserType === value
                          ? "border-brand-amber bg-brand-amber/15 shadow-sm ring-1 ring-brand-amber/25"
                          : "border-brand-amber/15 bg-brand-white hover:border-brand-amber/30 hover:bg-brand-cream/40"
                      )}
                    >
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    </button>
                  ))}
                </div>
              </FormSection>

              <FormSection
                id="section-5"
                step={5}
                icon={Layers}
                title="Scope"
                description="Narrow where this coupon applies. Leave everything empty for store-wide use."
              >
                <CategoryTreePicker
                  key={editId ?? "create"}
                  tree={categoryTree}
                  selectedIds={form.applicableCategories}
                  onChange={(applicableCategories) =>
                    setForm((f) => ({ ...f, applicableCategories }))
                  }
                />

                <div className="space-y-3 rounded-xl border border-brand-amber/15 bg-gradient-to-br from-brand-cream/30 to-brand-white p-4">
                  <Field
                    label="Applicable products (optional)"
                    hint="Search by product title and add specific items."
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-gray" />
                      <Input
                        value={productQuery}
                        onChange={(e) => setProductQuery(e.target.value)}
                        placeholder="Search products by title..."
                        className="pl-9"
                      />
                    </div>
                  </Field>
                  {productResults.length > 0 && (
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-brand-amber/15 bg-brand-white p-1">
                      {productResults.map((product) => (
                        <div
                          key={product._id}
                          className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-brand-cream/50"
                        >
                          <span className="truncate">{product.title}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => onAddProduct(product)}
                            className="shrink-0 border-brand-amber/20"
                          >
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedProducts.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedProducts.map((product) => (
                        <Badge key={product._id} variant="secondary" className="gap-1 py-1 pr-1">
                          {product.title}
                          <button
                            type="button"
                            className="ml-1 rounded-full px-1.5 hover:bg-brand-cream"
                            onClick={() => onRemoveProduct(product._id)}
                            aria-label={`Remove ${product.title}`}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </FormSection>

              <FormSection
                id="section-6"
                step={6}
                icon={CalendarClock}
                title="Schedule"
                description="Optional window for when the coupon is valid. Leave blank for no time limit."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Starts at" htmlFor="startsAt">
                    <Input
                      id="startsAt"
                      type="datetime-local"
                      value={form.startsAt}
                      onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                    />
                  </Field>
                  <Field label="Ends at" htmlFor="endsAt" hint="Must be after the start date.">
                    <Input
                      id="endsAt"
                      type="datetime-local"
                      value={form.endsAt}
                      onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                    />
                  </Field>
                </div>
              </FormSection>
            </div>

            <div className="hidden xl:block">
              <CouponSummaryPanel
                form={form}
                selectedProducts={selectedProducts}
                isEdit={isEdit}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-brand-amber/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {isEdit
                ? "Changes apply immediately for new checkouts."
                : "Coupons are platform-sponsored by default."}
            </p>
            <div className="flex gap-2">
              {isEdit && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isPending} size="lg" className="gap-1.5 px-6">
                <Sparkles className="size-4" />
                {isPending ? "Saving..." : isEdit ? "Save changes" : "Create coupon"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
