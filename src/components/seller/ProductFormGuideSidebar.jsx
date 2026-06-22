import { useEffect } from "react";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { Card } from "@/components/ui/card.jsx";
import { cn } from "@/lib/utils";
import {
  PRODUCT_FORM_GUIDE_STEPS,
  PRODUCT_FORM_GUIDE_TIPS,
} from "@/constants/productForm.js";

export function ProductFormGuideSidebar({ open, onClose, isEdit }) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close guide"
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Product creation guide"
        className={cn(
          "relative flex h-full w-full max-w-lg flex-col border-l border-brand-amber/20 bg-gradient-to-b from-brand-white via-brand-cream/20 to-brand-white shadow-2xl",
          "animate-in slide-in-from-right duration-300 [animation-fill-mode:both]"
        )}
      >
        <div className="flex items-center justify-between border-b border-brand-amber/15 bg-gradient-to-r from-brand-cream/50 to-brand-white px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gray">
              {isEdit ? "Update product" : "New product"}
            </p>
            <h2 className="mt-1 text-lg font-black tracking-tight">
              {isEdit ? "Product editing guide" : "Complete product guide"}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="shrink-0 text-brand-gray hover:bg-brand-cream hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            This guide walks through every section of the product form so you can create
            complete listings without missing required fields.
          </p>

          <div className="space-y-4">
            {PRODUCT_FORM_GUIDE_STEPS.map(({ icon: Icon, title, summary, details, example }, i) => (
              <Card
                key={title}
                className="overflow-hidden border-brand-amber/20 p-0 animate-in fade-in slide-in-from-right-2 [animation-fill-mode:both]"
                style={{ animationDelay: `${i * 50}ms`, animationDuration: "350ms" }}
              >
                <div className="flex gap-3 border-b border-brand-amber/10 bg-gradient-to-r from-brand-cream/40 to-brand-white px-4 py-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-amber/15 text-brand-amber ring-1 ring-brand-amber/15">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <h3 className="font-bold">{title}</h3>
                    <p className="text-xs text-muted-foreground">{summary}</p>
                  </div>
                </div>
                <div className="space-y-2 px-4 py-3 text-sm">
                  <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                    {details.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  {example && (
                    <p className="rounded-lg bg-brand-cream/50 px-3 py-2 font-mono text-xs text-foreground/80">
                      {example}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Card className="border-brand-amber/20 bg-brand-cream/30 p-4">
            <div className="flex gap-2">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-brand-amber" />
              <div>
                <p className="text-sm font-semibold">Quick tips</p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {PRODUCT_FORM_GUIDE_TIPS.map((tip) => (
                    <li key={tip}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </aside>
    </div>
  );
}
