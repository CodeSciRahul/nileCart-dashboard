import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Select } from "@/components/ui/table.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { ImageUpload } from "@/components/upload/ImageUpload.jsx";
import { UPLOAD_FOLDERS } from "@/constants/uploads.js";
import { DEPARTMENT_OPTIONS, formatParentDepartmentOption } from "@/lib/departments.js";
import { cn } from "@/lib/utils";
import { FolderTree, CircleHelp, Layers, Sparkles } from "lucide-react";

function FormSection({ title, description, children, className }) {
  return (
    <section className={cn("space-y-4", className)}>
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

export function CategoryForm({
  form,
  setForm,
  editId,
  flatCategories,
  parentOptions,
  onSubmit,
  onCancel,
  isPending,
  title,
  onOpenGuide,
}) {
  const isSubcategory = Boolean(form.parent);
  const isEdit = Boolean(editId);

  return (
    <Card className="w-full overflow-hidden border-brand-amber/25 p-0 shadow-md">
      <CardHeader className="border-b border-brand-amber/15 bg-gradient-to-br from-brand-cream/60 via-brand-white to-brand-cream/30 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-amber via-amber-400 to-brand-amber text-foreground shadow-md shadow-brand-amber/20 ring-1 ring-brand-amber/30">
              {isSubcategory ? <Layers className="size-6" /> : <FolderTree className="size-6" />}
            </span>
            <div className="min-w-0 pt-0.5">
              <CardTitle className="text-xl font-black tracking-tight">{title}</CardTitle>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {isEdit
                  ? "Update category details and save your changes."
                  : isSubcategory
                    ? "Add a subcategory under an existing department."
                    : "Create a new top-level department for the storefront."}
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
          <FormSection
            title="Structure"
            description="Define where this category sits in your catalog hierarchy."
          >
            <Field
              label="Parent department"
              hint="Leave empty to create a new department for the storefront header. Select a parent department to add a subcategory under it."
            >
              <Select
                value={form.parent}
                onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))}
                disabled={Boolean(
                  editId && flatCategories.find((c) => c._id === editId)?.children?.length
                )}
              >
                <option value="">None — create a new top-level department</option>
                {parentOptions.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {formatParentDepartmentOption(cat)}
                  </option>
                ))}
              </Select>
            </Field>

            {!form.parent && (
              <Field
                label="Department"
                hint="Department type shown in storefront navigation."
              >
                <Select
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  required
                >
                  <option value="">Select department type</option>
                  {DEPARTMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} — {opt.description}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
          </FormSection>

          <FormSection
            title="Details"
            description="Core information customers and sellers will see."
          >
            <Field label="Name">
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. T-Shirts, Dresses, Bottom wear"
                required
              />
            </Field>
            <Field label="Description">
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional short description"
              />
            </Field>
          </FormSection>

          <FormSection
            title="Media"
            description="Visual identity for this category on the storefront."
          >
            <ImageUpload
              label="Category image"
              folder={UPLOAD_FOLDERS.CATEGORIES}
              value={form.image}
              onChange={(image) => setForm((f) => ({ ...f, image }))}
            />
          </FormSection>

          <FormSection
            title="Display settings"
            description="Control visibility and sort order in navigation."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Display order">
                <Input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))}
                  min={0}
                />
              </Field>
              <div className="flex items-end pb-1">
                <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-brand-amber/15 bg-brand-cream/30 px-4 py-3 transition-colors hover:bg-brand-cream/50">
                  <input
                    type="checkbox"
                    checked={form.showInNav}
                    onChange={(e) => setForm((f) => ({ ...f, showInNav: e.target.checked }))}
                    className="size-4 accent-brand-amber"
                  />
                  <span className="text-sm font-medium">Show in navigation</span>
                </label>
              </div>
            </div>
          </FormSection>

          <div className="flex flex-col-reverse gap-2 border-t border-brand-amber/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {isEdit
                ? "Changes apply immediately across the storefront catalog."
                : "New categories appear in the catalog after creation."}
            </p>
            <div className="flex gap-2">
              {(isEdit || form.parent) && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isPending} className="min-w-[120px] gap-1.5">
                <Sparkles className="size-3.5" />
                {isPending ? "Saving..." : isEdit ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
