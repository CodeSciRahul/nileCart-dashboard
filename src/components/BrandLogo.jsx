import { cn } from "@/lib/utils";

export function BrandLogo({ className, compact = false, subtitle, light = false }) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-xl shadow-md ring-1",
          light
            ? "bg-brand-white/20 shadow-black/10 ring-brand-white/30 backdrop-blur-sm"
            : "bg-gradient-to-br from-brand-amber via-amber-400 to-brand-amber shadow-brand-amber/25 ring-brand-amber/30",
          compact ? "h-8 w-8" : "h-9 w-9"
        )}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          aria-hidden
        >
          <path
            d="M8 22V10l8-4 8 4v12l-8 4-8-4Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
            className={light ? "text-brand-white/90" : "text-foreground/90"}
          />
          <path
            d="M16 6v20M8 10l8 4 8-4M8 22l8-4 8 4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
            className={light ? "text-brand-white/70" : "text-foreground/70"}
          />
        </svg>
      </span>

      {!compact && (
        <span className="min-w-0 flex-col leading-none">
          <span
            className={cn(
              "text-base font-black tracking-tight",
              light
                ? "text-brand-white"
                : "bg-gradient-to-r from-brand-amber via-amber-500 to-brand-amber bg-clip-text text-transparent"
            )}
          >
            NILECART
          </span>
          {subtitle && (
            <span
              className={cn(
                "mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em]",
                light ? "text-brand-white/70" : "text-brand-gray"
              )}
            >
              {subtitle}
            </span>
          )}
        </span>
      )}
    </div>
  );
}
