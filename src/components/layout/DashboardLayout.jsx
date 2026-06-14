import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore.js";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  User,
  Users,
  Store,
  Ticket,
  Image,
  Megaphone,
  Wallet,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
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
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/banners", label: "Banners", icon: Image },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
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
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
        <span className="font-semibold text-sm">
          {variant === "admin" ? "Admin" : "Seller"} Dashboard
        </span>
        <Button variant="ghost" size="icon-sm" onClick={toggleSidebar}>
          <PanelLeftClose className="size-4" />
        </Button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {visibleItems.map(({ to, label, icon: Icon }) => {
          const active =
            location.pathname === to ||
            (to !== "/seller" && to !== "/admin" && location.pathname.startsWith(to));

          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function Header({ title }) {
  const { user, logout } = useAuth();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-4">
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <Button variant="ghost" size="icon-sm" onClick={toggleSidebar}>
            <PanelLeft className="size-4" />
          </Button>
        )}
        <h1 className="font-semibold text-lg">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground text-sm">{user?.email}</span>
        <Button variant="outline" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}

export function DashboardLayout({ title, variant = "seller", children }) {
  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar variant={variant} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
