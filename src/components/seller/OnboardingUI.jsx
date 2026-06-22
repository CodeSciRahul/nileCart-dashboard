import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button.jsx";
import { Label } from "@/components/ui/label.jsx";
import { ONBOARDING_PROGRESS_STEPS } from "@/constants/sellerOnboarding.js";
import { BookOpen, ClipboardList, Sparkles, Store } from "lucide-react";

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

export function OnboardingHero({ onOpenGuide }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-amber/25 bg-gradient-to-br from-brand-cream/50 via-brand-white to-brand-cream/30 p-5 shadow-sm animate-in fade-in slide-in-from-top-3 duration-500">
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand-amber/15 blur-3xl" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-amber via-amber-400 to-brand-amber shadow-md ring-1 ring-brand-amber/30">
            <Store className="size-7 text-foreground" />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gray">
              <Sparkles className="size-3 text-brand-amber" />
              Seller onboarding
            </p>
            <h2 className="text-xl font-black tracking-tight">Apply to become a seller</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete the form below to list products on the NileCart marketplace. Our team
              reviews applications within a few business days.
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

export function OnboardingProgress({ activeStep = 1, onStepClick }) {
  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-400 [animation-fill-mode:both]">
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ONBOARDING_PROGRESS_STEPS.map((label, i) => {
          const step = i + 1;
          const isActive = activeStep === step;

          return (
            <button
              key={label}
              type="button"
              onClick={() => onStepClick?.(step)}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                "hover:border-brand-amber/40 hover:bg-brand-cream/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber/30",
                isActive
                  ? "border-brand-amber/40 bg-brand-amber/15 text-foreground shadow-sm ring-1 ring-brand-amber/25"
                  : "border-brand-amber/20 bg-brand-white text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-[10px] font-black",
                  isActive ? "bg-brand-amber text-foreground" : "bg-brand-amber/15 text-brand-amber"
                )}
              >
                {step}
              </span>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function OnboardingWelcomeBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-brand-amber/20 bg-brand-cream/50 p-4 animate-in fade-in slide-in-from-top-2 duration-400">
      <ClipboardList className="mt-0.5 size-5 shrink-0 text-brand-amber" />
      <div>
        <p className="text-sm font-semibold text-foreground">What you&apos;ll need</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Have your business documents, address proof, and bank details ready. All fields marked
          with * are required for submission.
        </p>
      </div>
    </div>
  );
}
