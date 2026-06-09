import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { getAdminStats } from "@/services/adminService.js";
import { queryKeys } from "@/lib/queryKeys.js";

function AdminHomePage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: getAdminStats,
  });

  const stats = data?.stats;

  const cards = [
    { label: "Pending sellers", value: stats?.pendingSellers },
    { label: "Approved sellers", value: stats?.totalSellers },
    { label: "Orders today", value: stats?.ordersToday },
    { label: "Total orders", value: stats?.totalOrders },
    { label: "Active coupons", value: stats?.activeCoupons },
    { label: "Active banners", value: stats?.activeBanners },
  ];

  return (
    <DashboardLayout title="Admin Dashboard" variant="admin">
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(({ label, value }) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{isLoading ? "..." : (value ?? "—")}</p>
            </CardContent>
          </Card>
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
