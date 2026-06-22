import { useEffect } from "react";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { Card } from "@/components/ui/card.jsx";
import { cn } from "@/lib/utils";

export function CouponFormGuideSidebar({ open, onClose, isEdit, steps, tips = [] }) {
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
        aria-label="Coupon creation guide"
        className={cn(
          "relative flex h-full w-full max-w-lg flex-col border-l border-brand-amber/20 bg-gradient-to-b from-brand-white via-brand-cream/20 to-brand-white shadow-2xl",
          "animate-in slide-in-from-right duration-300 [animation-fill-mode:both]"
        )}
      >
        <div className="flex items-center justify-between border-b border-brand-amber/15 bg-gradient-to-r from-brand-cream/50 to-brand-white px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gray">
              {isEdit ? "Update coupon" : "New coupon"}
            </p>
            <h2 className="mt-1 text-lg font-black tracking-tight">
              {isEdit ? "Coupon editing guide" : "Complete coupon guide"}
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
            Platform coupons are applied at checkout on the NileCart storefront. This guide
            walks through every field so you can create effective offers without guesswork.
          </p>

          <div className="space-y-4">
            {steps.map(({ icon: Icon, title, summary, details, example }, i) => (
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
                    <p className="text-xs font-bold uppercase tracking-wide text-brand-gray">
                      Step {i + 1}
                    </p>
                    <p className="font-semibold text-foreground">{title}</p>
                  </div>
                </div>
                <div className="space-y-3 px-4 py-3">
                  <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
                  {details?.length > 0 && (
                    <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                      {details.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-amber" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {example && (
                    <div className="rounded-lg border border-brand-amber/15 bg-brand-cream/40 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-gray">
                        Example
                      </p>
                      <p className="mt-1 font-mono text-xs font-medium text-foreground">
                        {example}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {tips.length > 0 && (
            <Card className="border-brand-amber/20 bg-brand-cream/30 p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                <Lightbulb className="size-3.5 text-brand-amber" />
                Pro tips
              </p>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
                {tips.map((tip) => (
                  <li key={tip} className="flex gap-2">
                    <span className="text-brand-amber">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </aside>
    </div>
  );
}
