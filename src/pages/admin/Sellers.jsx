import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Button } from "@/components/ui/button.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.jsx";
import { Badge } from "@/components/ui/badge.jsx";
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
      <div className="mb-4 flex gap-2">
        {["Pending", "Approved", "Rejected"].map((s) => (
          <Button
            key={s}
            variant={tab === s ? "default" : "outline"}
            size="sm"
            onClick={() => setTab(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sellers.map((seller) => (
              <TableRow key={seller._id}>
                <TableCell>{seller.storeName}</TableCell>
                <TableCell>{seller.user?.email || seller.user?.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{seller.approvalStatus}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link to={`/admin/seller/${seller._id}`}>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
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
