import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { SellerApplicationsCatalog } from "@/components/admin/SellerApplicationsCatalog.jsx";
import { listSellers } from "@/services/adminService.js";
import { queryKeys } from "@/lib/queryKeys.js";

function SellersPage() {
  const [tab, setTab] = useState("Pending");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.sellers(tab),
    queryFn: () => listSellers({ status: tab }),
  });

  const sellers = data?.sellers || [];

  return (
    <DashboardLayout title="Seller applications" variant="admin">
      <SellerApplicationsCatalog
        sellers={sellers}
        isLoading={isLoading}
        activeTab={tab}
        onTabChange={setTab}
      />
    </DashboardLayout>
  );
}

export default function Sellers() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <SellersPage />
    </ProtectedRoute>
  );
}
