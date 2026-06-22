import { BrandLogo } from "@/components/BrandLogo.jsx";

export function AuthLayout({ children, title, description }) {
  return (
    <main className="flex min-h-svh">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-amber via-amber-400 to-brand-amber p-10 text-foreground lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
        <div className="relative">
          <BrandLogo light subtitle="Dashboard" />
        </div>
        <div className="relative space-y-4">
          <h2 className="text-3xl font-black leading-tight tracking-tight">
            Manage your NileCart marketplace
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-foreground/80">
            Access seller tools, track orders, and manage your store — all from one
            professional dashboard built for the NileCart ecosystem.
          </p>
        </div>
        <p className="relative text-xs font-medium uppercase tracking-[0.2em] text-foreground/60">
          Fashion Store Platform
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-brand-cream/40 via-brand-white to-brand-cream/20 p-6">
        <div className="mb-8 lg:hidden">
          <BrandLogo subtitle="Dashboard" />
        </div>
        <div className="w-full max-w-md space-y-2 text-center lg:text-left">
          {title && <h1 className="text-2xl font-black tracking-tight">{title}</h1>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="mt-6 w-full max-w-md">{children}</div>
      </div>
    </main>
  );
}
