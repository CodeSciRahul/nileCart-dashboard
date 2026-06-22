import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  Store,
  CalendarDays,
  ShoppingCart,
  Ticket,
  Image,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { StatCard } from "@/components/ui/stat-card.jsx";
import { getAdminStats } from "@/services/adminService.js";
import { queryKeys } from "@/lib/queryKeys.js";

function AdminHomePage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: getAdminStats,
  });

  const stats = data?.stats;

  const cards = [
    { label: "Pending sellers", value: stats?.pendingSellers, icon: Clock },
    { label: "Approved sellers", value: stats?.totalSellers, icon: Store },
    { label: "Orders today", value: stats?.ordersToday, icon: CalendarDays },
    { label: "Total orders", value: stats?.totalOrders, icon: ShoppingCart },
    { label: "Active coupons", value: stats?.activeCoupons, icon: Ticket },
    { label: "Active banners", value: stats?.activeBanners, icon: Image },
  ];

  return (
    <DashboardLayout title="Admin Dashboard" variant="admin">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Overview of marketplace activity and pending actions.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, icon }, index) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            icon={icon}
            index={index}
            isLoading={isLoading}
          />
        ))}
      </div>
    </DashboardLayout>
  );
}

export default function AdminHome() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <AdminHomePage />
    </ProtectedRoute>
  );
}
