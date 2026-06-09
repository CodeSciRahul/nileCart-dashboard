import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Select } from "@/components/ui/table.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { getSellerOrder, updateSellerOrderStatus } from "@/services/orderService.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { useState } from "react";
import { toast } from "sonner";

const SELLER_STATUSES = ["confirmed", "packed", "shipped", "out_for_delivery", "delivered"];

function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.seller.order(id),
    queryFn: () => getSellerOrder(id),
  });

  const order = data?.order;

  const mutation = useMutation({
    mutationFn: (payload) => updateSellerOrderStatus(id, payload),
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.seller.order(id) });
      queryClient.invalidateQueries({ queryKey: ["seller", "orders"] });
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Order detail" variant="seller">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout title="Order detail" variant="seller">
        <p className="text-muted-foreground text-sm">Order not found.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Order ${order.orderNumber}`} variant="seller">
      <div className="mb-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Order info
              <Badge variant="secondary">{order.orderStatus}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Customer: {order.user?.name || order.user?.email}</p>
            <p>Total: ₹{order.total}</p>
            <p>Payment: {order.paymentMethod} ({order.paymentStatus})</p>
            <p>Placed: {new Date(order.createdAt).toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update status</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="flex-1">
              <option value="">Select status</option>
              {SELLER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Button
              disabled={!status || mutation.isPending}
              onClick={() => mutation.mutate({ status })}
            >
              Update
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between border-b border-border pb-2">
                <span>
                  {item.title} × {item.quantity}
                </span>
                <span>₹{item.price * item.quantity}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default function OrderDetail() {
  return (
    <ProtectedRoute roles={["seller"]} requireApprovedSeller>
      <OrderDetailPage />
    </ProtectedRoute>
  );
}
