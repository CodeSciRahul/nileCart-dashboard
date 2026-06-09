import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Button } from "@/components/ui/button.jsx";
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
import { getAdminOrders, updateAdminOrderStatus } from "@/services/adminService.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { toast } from "sonner";

const ALL_STATUSES = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("");
  const [updateId, setUpdateId] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.orders({ status: filterStatus }),
    queryFn: () => getAdminOrders(filterStatus ? { status: filterStatus } : {}),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }) => updateAdminOrderStatus(id, { status }),
    onSuccess: () => {
      toast.success("Order updated");
      setUpdateId(null);
      setNewStatus("");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });

  const orders = data?.orders || [];

  return (
    <DashboardLayout title="Orders" variant="admin">
      <div className="mb-4">
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-48"
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.user?.email || "—"}</TableCell>
                <TableCell>₹{order.total}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{order.orderStatus}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {updateId === order._id ? (
                    <div className="flex justify-end gap-2">
                      <Select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-40"
                      >
                        <option value="">Status</option>
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                      <Button
                        size="sm"
                        disabled={!newStatus}
                        onClick={() => mutation.mutate({ id: order._id, status: newStatus })}
                      >
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setUpdateId(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setUpdateId(order._id)}>
                      Update
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DashboardLayout>
  );
}

export default function AdminOrders() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <AdminOrdersPage />
    </ProtectedRoute>
  );
}
