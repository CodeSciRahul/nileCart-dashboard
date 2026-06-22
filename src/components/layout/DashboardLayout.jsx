import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore.js";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  FolderPlus,
  ShoppingCart,
  User,
  Users,
  Store,
  Ticket,
  Image,
  Megaphone,
  PlusCircle,
  Wallet,
  PanelLeftClose,
  PanelLeft,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { BrandLogo } from "@/components/BrandLogo.jsx";
import { isApprovedSeller } from "@/lib/redirect.js";
import { useAuth } from "@/context/AuthContext.jsx";

const sellerNav = [
  { to: "/seller", label: "Dashboard", icon: LayoutDashboard, approvedOnly: true },
  { to: "/seller/onboarding", label: "Apply", icon: Store, approvedOnly: false, hideWhenApproved: true },
  { to: "/seller/profile", label: "Profile", icon: User, approvedOnly: false },
  { to: "/seller/products", label: "Products", icon: Package, approvedOnly: true },
  { to: "/seller/orders", label: "Orders", icon: ShoppingCart, approvedOnly: true },
];

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/sellers", label: "Sellers", icon: Store },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/coupons", label: "All Coupons", icon: Ticket, exact: true },
  { to: "/admin/coupons/new", label: "Create Coupon", icon: PlusCircle, matchCreate: true },
  { to: "/admin/banners", label: "Banners", icon: Image },
  { to: "/admin/announcements", label: "All Announcements", icon: Megaphone, exact: true },
  { to: "/admin/announcements/new", label: "Create Announcement", icon: PlusCircle, matchCreate: true },
  { to: "/admin/categories", label: "All Categories", icon: FolderTree, exact: true },
  { to: "/admin/categories/new", label: "Create Category", icon: FolderPlus, matchCreate: true },
  { to: "/admin/payouts", label: "Payouts", icon: Wallet },
];

export function Sidebar({ variant = "seller" }) {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const { user } = useAuth();
  const approved = isApprovedSeller(user);

  const items = variant === "admin" ? adminNav : sellerNav;

  const visibleItems = items.filter((item) => {
    if (item.approvedOnly && !approved) return false;
    if (item.hideWhenApproved && approved) return false;
    return true;
  });

  if (!sidebarOpen) return null;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-gradient-to-b from-sidebar via-brand-white to-brand-cream/30 text-sidebar-foreground shadow-sm">
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border bg-gradient-to-r from-brand-cream/40 via-brand-white to-brand-cream/40 px-4">
        <BrandLogo subtitle={variant === "admin" ? "Admin Panel" : "Seller Hub"} />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleSidebar}
          className="text-muted-foreground hover:bg-brand-cream/60 hover:text-foreground"
        >
          <PanelLeftClose className="size-4" />
        </Button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gray">
          Navigation
        </p>
        {visibleItems.map(({ to, label, icon: Icon, exact, matchCreate }) => {
          const createBase = matchCreate ? to.replace(/\/new$/, "") : "";
          const active = matchCreate
            ? location.pathname === to ||
              new RegExp(`^${createBase}/[^/]+/edit$`).test(location.pathname)
            : exact
              ? location.pathname === to
              : location.pathname === to ||
                (to !== "/seller" &&
                  to !== "/admin" &&
                  location.pathname.startsWith(to));

          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-brand-amber text-foreground shadow-sm ring-1 ring-brand-amber/20"
                  : "text-sidebar-foreground hover:bg-brand-cream hover:text-brand-amber"
              )}
            >
              <Icon className={cn("size-4", active ? "text-foreground" : "text-brand-gray")} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <p className="truncate px-3 text-xs text-brand-gray">{user?.email}</p>
      </div>
    </aside>
  );
}

export function Header({ title }) {
  const { user, logout } = useAuth();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  const initials = user?.email?.charAt(0).toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-brand-white/95 px-4 shadow-sm backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            className="hover:bg-brand-cream"
          >
            <PanelLeft className="size-4" />
          </Button>
        )}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gray">
            NileCart
          </p>
          <h1 className="font-bold text-lg leading-tight tracking-tight">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-amber via-amber-400 to-brand-amber text-xs font-bold text-foreground shadow-sm ring-1 ring-brand-amber/20">
            {initials}
          </span>
          <span className="max-w-[180px] truncate text-sm text-muted-foreground">
            {user?.email}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="border-brand-amber/20 hover:bg-brand-cream hover:text-foreground"
        >
          <LogOut className="size-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}

export function DashboardLayout({ title, variant = "seller", children }) {
  return (
    <div className="flex min-h-svh bg-gradient-to-br from-brand-cream/30 via-brand-white to-brand-cream/20">
      <Sidebar variant={variant} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} />
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
