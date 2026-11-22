import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { SellerApplicationsCatalog } from "@/components/admin/SellerApplicationsCatalog.jsx";
import { listSellers } from "@/services/adminService.js";
import { queryKeys } from "@/lib/queryKeys.js";

function SellersPage() {
  const [tab, setTab] = useState("Pending");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.sellers(`${tab}:${page}`),
    queryFn: () => listSellers({ page, limit: 10, status: tab }),
  });

  const sellers = data?.sellers || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: sellers.length };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setPage(1);
  };

  return (
    <DashboardLayout title="Seller applications" variant="admin">
      <SellerApplicationsCatalog
        sellers={sellers}
        isLoading={isLoading}
        activeTab={tab}
        onTabChange={handleTabChange}
        pagination={pagination}
        onPageChange={setPage}
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
