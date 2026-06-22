import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { Card } from "@/components/ui/card.jsx";
import { cn } from "@/lib/utils";

export function CategoryFormGuideSidebar({ open, onClose, isEdit, steps }) {
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
        aria-label="Category creation guide"
        className={cn(
          "relative flex h-full w-full max-w-md flex-col border-l border-brand-amber/20 bg-gradient-to-b from-brand-white via-brand-cream/20 to-brand-white shadow-2xl",
          "animate-in slide-in-from-right duration-300 [animation-fill-mode:both]"
        )}
      >
        <div className="flex items-center justify-between border-b border-brand-amber/15 bg-gradient-to-r from-brand-cream/50 to-brand-white px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gray">
              {isEdit ? "Update catalog entry" : "New catalog entry"}
            </p>
            <h2 className="mt-1 text-lg font-black tracking-tight">
              {isEdit ? "Refine your category" : "Build your catalog"}
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

        <div className="flex-1 overflow-y-auto p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Build a two-level catalog: top-level departments (Men, Women, Kids, Sports, etc.)
            and subcategories under them (e.g. T-Shirts, Dresses).
          </p>

          <Card className="mt-5 overflow-hidden border-brand-amber/20 p-0">
            <div className="border-b border-brand-amber/10 bg-gradient-to-r from-brand-cream/50 to-brand-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                Quick guide
              </p>
            </div>
            <ul className="divide-y divide-brand-amber/10">
              {steps.map(({ icon: Icon, title, text }, i) => (
                <li
                  key={title}
                  className="flex gap-3 px-4 py-4 animate-in fade-in slide-in-from-right-2 [animation-fill-mode:both]"
                  style={{ animationDelay: `${i * 60}ms`, animationDuration: "350ms" }}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-amber/15 text-brand-amber ring-1 ring-brand-amber/15">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </aside>
    </div>
  );
}
