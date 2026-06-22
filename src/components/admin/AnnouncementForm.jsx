import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { cn } from "@/lib/utils";
import { CircleHelp, Megaphone, Palette, Sparkles } from "lucide-react";

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

function ColorField({ label, value, onChange }) {
  const pickerValue = value || "#ffffff";

  return (
    <Field label={label}>
      <div className="flex gap-2">
        <Input
          type="color"
          className="h-9 w-14 shrink-0 cursor-pointer rounded-lg border-brand-amber/20 p-1"
          value={pickerValue}
          onChange={(e) => onChange(e.target.value)}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#ffffff"
        />
      </div>
    </Field>
  );
}

function AnnouncementPreview({ message, backgroundColor, textColor }) {
  if (!message) {
    return (
      <div className="rounded-xl border border-dashed border-brand-amber/25 bg-brand-cream/30 px-4 py-6 text-center text-xs text-muted-foreground">
        Live preview appears here as you type
      </div>
    );
  }

  return (
    <div
      className="rounded-xl px-4 py-3 text-sm font-medium shadow-sm ring-1 ring-black/5 transition-all"
      style={{
        backgroundColor: backgroundColor || "#fff5d1",
        color: textColor || "#1a1a1a",
      }}
    >
      {message}
    </div>
  );
}

export function AnnouncementForm({
  form,
  setForm,
  isEdit,
  onSubmit,
  onCancel,
  isPending,
  onOpenGuide,
}) {
  return (
    <Card className="w-full overflow-hidden border-brand-amber/25 p-0 shadow-md">
      <CardHeader className="border-b border-brand-amber/15 bg-gradient-to-br from-brand-cream/60 via-brand-white to-brand-cream/30 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-amber via-amber-400 to-brand-amber text-foreground shadow-md shadow-brand-amber/20 ring-1 ring-brand-amber/30">
              <Megaphone className="size-6" />
            </span>
            <div className="min-w-0 pt-0.5">
              <CardTitle className="text-xl font-black tracking-tight">
                {isEdit ? "Edit announcement" : "Create announcement"}
              </CardTitle>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {isEdit
                  ? "Update the announcement message, styling, and schedule."
                  : "Publish a storefront banner message for customers to see."}
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
            title="Message"
            description="The text shown in the storefront announcement bar."
          >
            <Field label="Message *">
              <Textarea
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="e.g. Hi welcome to NileCart — free shipping this week!"
                className="min-h-24"
                required
              />
            </Field>
          </FormSection>

          <FormSection
            title="Styling"
            description="Customize background and text colors for the announcement bar."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ColorField
                label="Background color"
                value={form.backgroundColor}
                onChange={(backgroundColor) => setForm((f) => ({ ...f, backgroundColor }))}
              />
              <ColorField
                label="Text color"
                value={form.textColor}
                onChange={(textColor) => setForm((f) => ({ ...f, textColor }))}
              />
            </div>
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                <Palette className="size-3.5 text-brand-amber" />
                Live preview
              </p>
              <AnnouncementPreview
                message={form.message}
                backgroundColor={form.backgroundColor}
                textColor={form.textColor}
              />
            </div>
          </FormSection>

          <FormSection
            title="Scheduling & priority"
            description="Control when the announcement appears and its display order."
          >
            <Field label="Priority" hint="Higher priority shows first.">
              <Input
                type="number"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                min={0}
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
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

          <FormSection title="Status" description="Toggle visibility on the storefront.">
            <label className="flex w-full max-w-sm cursor-pointer items-center gap-3 rounded-xl border border-brand-amber/15 bg-brand-cream/30 px-4 py-3 transition-colors hover:bg-brand-cream/50">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="size-4 accent-brand-amber"
              />
              <span className="text-sm font-medium">Active</span>
            </label>
          </FormSection>

          <div className="flex flex-col-reverse gap-2 border-t border-brand-amber/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {isEdit
                ? "Changes apply immediately on the storefront."
                : "New announcements appear after creation when active."}
            </p>
            <div className="flex gap-2">
              {isEdit && (
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
