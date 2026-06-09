import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { getSellerStats } from "@/services/sellerService.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";

function SellerHomePage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.seller.stats,
    queryFn: getSellerStats,
  });

  const stats = data?.stats;

  return (
    <DashboardLayout title="Dashboard" variant="seller">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Active products", value: stats?.productCount ?? "—" },
          { label: "Total orders", value: stats?.totalOrders ?? "—" },
          { label: "Pending orders", value: stats?.pendingOrders ?? "—" },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{isLoading ? "..." : value}</p>
            </CardContent>
          </Card>
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
