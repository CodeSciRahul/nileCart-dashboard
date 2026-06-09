import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import {
  listCoupons,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
} from "@/services/adminService.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { toast } from "sonner";

const emptyForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  usageLimit: "",
};

function CouponsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.coupons,
    queryFn: listCoupons,
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => (editId ? updateCoupon(editId, payload) : createCoupon(payload)),
    onSuccess: () => {
      toast.success(editId ? "Coupon updated" : "Coupon created");
      setForm(emptyForm);
      setEditId(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.coupons });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => toggleCouponStatus(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.coupons }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({
      ...form,
      discountValue: Number(form.discountValue),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
    });
  };

  const coupons = data?.coupons || [];

  return (
    <DashboardLayout title="Coupons" variant="admin">
      <Card className="mb-6 max-w-xl">
        <CardHeader>
          <CardTitle>{editId ? "Edit coupon" : "Create coupon"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                required
                disabled={!!editId}
              />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select
                value={form.discountType}
                onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
              >
                <option value="percentage">Percentage</option>
                <option value="flat">Flat</option>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Value</Label>
              <Input
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Min order</Label>
              <Input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <Button type="submit" disabled={saveMutation.isPending}>
              {editId ? "Update" : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((c) => (
              <TableRow key={c._id}>
                <TableCell>{c.code}</TableCell>
                <TableCell>{c.discountType}</TableCell>
                <TableCell>{c.discountValue}</TableCell>
                <TableCell>
                  <Badge variant={c.isActive ? "success" : "secondary"}>
                    {c.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditId(c._id);
                      setForm({
                        code: c.code,
                        description: c.description || "",
                        discountType: c.discountType,
                        discountValue: String(c.discountValue),
                        minOrderAmount: String(c.minOrderAmount || ""),
                        maxDiscount: c.maxDiscount ? String(c.maxDiscount) : "",
                        usageLimit: c.usageLimit ? String(c.usageLimit) : "",
                      });
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleMutation.mutate({ id: c._id, isActive: !c.isActive })}
                  >
                    {c.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DashboardLayout>
  );
}

export default function Coupons() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <CouponsPage />
    </ProtectedRoute>
  );
}
