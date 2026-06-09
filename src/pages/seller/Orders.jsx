import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Select } from "@/components/ui/table.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { getSellerOrders } from "@/services/orderService.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { useState } from "react";

function OrdersPage() {
  const [status, setStatus] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.seller.orders({ status }),
    queryFn: () => getSellerOrders(status ? { status } : {}),
  });

  const orders = data?.orders || [];

  return (
    <DashboardLayout title="Orders" variant="seller">
      <div className="mb-4">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-48">
          <option value="">All statuses</option>
          <option value="placed">Placed</option>
          <option value="confirmed">Confirmed</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground text-sm">No orders found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.user?.name || order.user?.email || "—"}</TableCell>
                <TableCell>₹{order.total}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{order.orderStatus}</Badge>
                </TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Link
                    to={`/seller/orders/${order._id}`}
                    className="text-primary text-sm hover:underline"
                  >
                    View
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

export default function Orders() {
  return (
    <ProtectedRoute roles={["seller"]} requireApprovedSeller>
      <OrdersPage />
    </ProtectedRoute>
  );
}
