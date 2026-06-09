import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import {
  listSellers,
  approveSeller,
  rejectSeller,
  deactivateSeller,
} from "@/services/adminService.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { toast } from "sonner";

function SellersPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("Pending");
  const [actionId, setActionId] = useState(null);
  const [commissionRate, setCommissionRate] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.sellers(tab),
    queryFn: () => listSellers({ status: tab }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, payload }) => approveSeller(id, payload),
    onSuccess: () => {
      toast.success("Seller approved");
      setActionId(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "sellers"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, payload }) => rejectSeller(id, payload),
    onSuccess: () => {
      toast.success("Seller rejected");
      setActionId(null);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["admin", "sellers"] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateSeller,
    onSuccess: () => {
      toast.success("Seller deactivated");
      queryClient.invalidateQueries({ queryKey: ["admin", "sellers"] });
    },
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
                  {tab === "Pending" && (
                    <div className="flex justify-end gap-2">
                      {actionId === seller._id ? (
                        <div className="flex items-end gap-2">
                          <div className="space-y-1 text-left">
                            <Label className="text-xs">Commission %</Label>
                            <Input
                              type="number"
                              className="h-8 w-24"
                              value={commissionRate}
                              onChange={(e) => setCommissionRate(e.target.value)}
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={() =>
                              approveMutation.mutate({
                                id: seller._id,
                                payload: {
                                  commissionRate: commissionRate
                                    ? Number(commissionRate)
                                    : undefined,
                                },
                              })
                            }
                          >
                            Confirm
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setActionId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button size="sm" onClick={() => setActionId(seller._id)}>
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const reason = prompt("Rejection reason:");
                              if (reason?.trim()) {
                                rejectMutation.mutate({
                                  id: seller._id,
                                  payload: { reason: reason.trim() },
                                });
                              }
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                  {tab === "Approved" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deactivateMutation.mutate(seller._id)}
                    >
                      Deactivate
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

export default function Sellers() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <SellersPage />
    </ProtectedRoute>
  );
}
