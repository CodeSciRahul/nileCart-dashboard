import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingCart, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { StatCard } from "@/components/ui/stat-card.jsx";
import { getSellerStats } from "@/services/sellerService.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";

function SellerHomePage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.seller.stats,
    queryFn: getSellerStats,
  });

  const stats = data?.stats;

  const cards = [
    { label: "Active products", value: stats?.productCount ?? "—", icon: Package },
    { label: "Total orders", value: stats?.totalOrders ?? "—", icon: ShoppingCart },
    { label: "Pending orders", value: stats?.pendingOrders ?? "—", icon: Clock },
  ];

  return (
    <DashboardLayout title="Dashboard" variant="seller">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Your store performance at a glance.
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

export default function SellerHome() {
  return (
    <ProtectedRoute roles={["seller"]} requireApprovedSeller>
      <SellerHomePage />
    </ProtectedRoute>
  );
}
