import { useEffect, useState } from "react";
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
  listAdminCategories,
  searchProducts,
} from "@/services/adminService.js";
import { CategoryTreePicker } from "@/components/admin/CategoryTreePicker.jsx";
import { useDebouncedValue } from "@/hooks/useDebouncedValue.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { toast } from "sonner";

const emptyForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "0",
  maxDiscount: "",
  usageLimit: "",
  maxUsesPerUser: "1",
  restoreOnCancel: false,
  eligibleUserType: "all",
  applicableCategories: [],
  startsAt: "",
  endsAt: "",
};

const toDatetimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
};

const refId = (value) => (value && typeof value === "object" ? value._id : value);

const couponToForm = (coupon) => ({
  code: coupon.code || "",
  description: coupon.description || "",
  discountType: coupon.discountType || "percentage",
  discountValue: String(coupon.discountValue ?? ""),
  minOrderAmount: String(coupon.minOrderAmount ?? 0),
  maxDiscount: coupon.maxDiscount != null ? String(coupon.maxDiscount) : "",
  usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : "",
  maxUsesPerUser: String(coupon.maxUsesPerUser ?? 1),
  restoreOnCancel: Boolean(coupon.restoreOnCancel),
  eligibleUserType: coupon.eligibleUserType || "all",
  applicableCategories: (coupon.applicableCategories || []).map(refId),
  startsAt: toDatetimeLocal(coupon.startsAt),
  endsAt: toDatetimeLocal(coupon.endsAt),
});

const buildPayload = (form, selectedProducts) => {
  if (form.startsAt && form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt)) {
    throw new Error("End date must be after start date");
  }

  const discountValue = Number(form.discountValue);
  if (!form.code?.trim()) throw new Error("Coupon code is required");
  if (!form.discountType) throw new Error("Discount type is required");
  if (Number.isNaN(discountValue) || discountValue < 0) {
    throw new Error("Enter a valid discount value");
  }

  return {
    code: form.code.trim().toUpperCase(),
    description: form.description?.trim() || undefined,
    discountType: form.discountType,
    discountValue,
    minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
    maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
    usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
    maxUsesPerUser: form.maxUsesPerUser ? Number(form.maxUsesPerUser) : 1,
    restoreOnCancel: Boolean(form.restoreOnCancel),
    eligibleUserType: form.eligibleUserType,
    sponsoredBy: "platform",
    seller: null,
    applicableCategories: form.applicableCategories || [],
    applicableProducts: selectedProducts.map((p) => p._id),
    startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
    endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
  };
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString();
};

function CouponsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productQuery, setProductQuery] = useState("");
  const [productResults, setProductResults] = useState([]);
  const debouncedProductQuery = useDebouncedValue(productQuery, 300);
  const [editId, setEditId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.coupons,
    queryFn: listCoupons,
  });

  const { data: categoriesData } = useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: () => listAdminCategories({ tree: "true" }),
  });

  const categoryTree = categoriesData?.categories || [];

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedProducts([]);
    setProductQuery("");
    setProductResults([]);
    setEditId(null);
  };

  const saveMutation = useMutation({
    mutationFn: (payload) => (editId ? updateCoupon(editId, payload) : createCoupon(payload)),
    onSuccess: () => {
      toast.success(editId ? "Coupon updated" : "Coupon created");
      resetForm();
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.coupons });
    },
    onError: (err) => toast.error(err.message || "Failed to save coupon"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => toggleCouponStatus(id, { isActive }),
    onSuccess: () => {
      toast.success("Coupon status updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.coupons });
    },
    onError: (err) => toast.error(err.message || "Failed to update status"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const payload = buildPayload(form, selectedProducts);
      saveMutation.mutate(payload);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    const q = debouncedProductQuery.trim();
    if (!q) {
      setProductResults([]);
      return;
    }

    let cancelled = false;

    searchProducts({ q, limit: 10 })
      .then((res) => {
        if (!cancelled) setProductResults(res?.products || []);
      })
      .catch((err) => {
        if (!cancelled) toast.error(err.message || "Product search failed");
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedProductQuery]);

  const addProduct = (product) => {
    if (selectedProducts.some((p) => p._id === product._id)) return;
    setSelectedProducts((prev) => [...prev, { _id: product._id, title: product.title }]);
  };

  const removeProduct = (productId) => {
    setSelectedProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  const startEdit = (coupon) => {
    setEditId(coupon._id);
    setForm(couponToForm(coupon));
    setSelectedProducts(
      (coupon.applicableProducts || []).map((p) =>
        typeof p === "object"
          ? { _id: p._id, title: p.title || p.slug || String(p._id) }
          : { _id: p, title: String(p) }
      )
    );
    setProductQuery("");
    setProductResults([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const coupons = data?.coupons || [];

  return (
    <DashboardLayout title="Coupons" variant="admin">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{editId ? "Edit coupon" : "Create coupon"}</CardTitle>
          {editId && (
            <Button type="button" variant="outline" size="sm" onClick={resetForm}>
              Cancel edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="space-y-3">
              <h3 className="font-medium text-sm">Basic details</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    value={form.code}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                    }
                    placeholder="NILECART20"
                    required
                    disabled={!!editId}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="20% off on orders above ₹999"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-medium text-sm">Discount rules</h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <Label htmlFor="discountType">Discount type *</Label>
                  <Select
                    id="discountType"
                    value={form.discountType}
                    onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat amount</option>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="discountValue">Discount value *</Label>
                  <Input
                    id="discountValue"
                    type="number"
                    min="0"
                    step="any"
                    value={form.discountValue}
                    onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="minOrderAmount">Min order amount</Label>
                  <Input
                    id="minOrderAmount"
                    type="number"
                    min="0"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="maxDiscount">Max discount (for %)</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    min="0"
                    value={form.maxDiscount}
                    onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
                    disabled={form.discountType !== "percentage"}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-medium text-sm">Usage limits</h3>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="usageLimit">Global usage limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="1"
                    value={form.usageLimit}
                    onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                    placeholder="Unlimited"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="maxUsesPerUser">Max uses per user *</Label>
                  <Input
                    id="maxUsesPerUser"
                    type="number"
                    min="1"
                    value={form.maxUsesPerUser}
                    onChange={(e) => setForm((f) => ({ ...f, maxUsesPerUser: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex items-end gap-2 pb-2">
                  <input
                    id="restoreOnCancel"
                    type="checkbox"
                    checked={form.restoreOnCancel}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, restoreOnCancel: e.target.checked }))
                    }
                    className="size-4 rounded border-input"
                  />
                  <Label htmlFor="restoreOnCancel" className="cursor-pointer">
                    Restore coupon if order is cancelled
                  </Label>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-medium text-sm">User eligibility</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="eligibleUserType">Eligible users *</Label>
                  <Select
                    id="eligibleUserType"
                    value={form.eligibleUserType}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, eligibleUserType: e.target.value }))
                    }
                    required
                  >
                    <option value="all">All users</option>
                    <option value="new">New users (no delivered orders)</option>
                    <option value="returning">Returning users</option>
                  </Select>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-medium text-sm">Scope</h3>

              <CategoryTreePicker
                key={editId ?? "create"}
                tree={categoryTree}
                selectedIds={form.applicableCategories}
                onChange={(applicableCategories) =>
                  setForm((f) => ({ ...f, applicableCategories }))
                }
              />

              <div className="space-y-2">
                <Label>Applicable products (optional)</Label>
                <p className="text-muted-foreground text-xs">
                  Leave empty to apply to all products (within other scope rules).
                </p>
                <Input
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  placeholder="Search products by title"
                />
                {productResults.length > 0 && (
                  <div className="rounded-lg border border-border p-2">
                    {productResults.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center justify-between gap-2 py-1 text-sm"
                      >
                        <span>{product.title}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addProduct(product)}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {selectedProducts.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedProducts.map((product) => (
                      <Badge key={product._id} variant="secondary" className="gap-1 pr-1">
                        {product.title}
                        <button
                          type="button"
                          className="ml-1 rounded px-1 hover:bg-muted"
                          onClick={() => removeProduct(product._id)}
                          aria-label={`Remove ${product.title}`}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-medium text-sm">Schedule</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="startsAt">Starts at</Label>
                  <Input
                    id="startsAt"
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="endsAt">Ends at</Label>
                  <Input
                    id="endsAt"
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                  />
                </div>
              </div>
            </section>

            <div className="flex gap-2">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending
                  ? "Saving..."
                  : editId
                    ? "Save changes"
                    : "Create coupon"}
              </Button>
              {editId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
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
              <TableHead>Discount</TableHead>
              <TableHead>Eligibility</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Valid period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground text-center">
                  No coupons yet. Create one above.
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((c) => (
                <TableRow key={c._id}>
                  <TableCell>
                    <div className="font-medium">{c.code}</div>
                    {c.description && (
                      <div className="text-muted-foreground text-xs">{c.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {c.discountType === "percentage"
                      ? `${c.discountValue}%`
                      : `₹${c.discountValue}`}
                    {c.minOrderAmount > 0 && (
                      <div className="text-muted-foreground text-xs">
                        Min ₹{c.minOrderAmount}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs capitalize">{c.eligibleUserType || "all"}</div>
                    <div className="text-muted-foreground text-xs">Platform</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      {c.usedCount ?? 0}
                      {c.usageLimit ? ` / ${c.usageLimit}` : ""} total
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {c.maxUsesPerUser ?? 1} per user
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">{formatDate(c.startsAt)}</div>
                    <div className="text-muted-foreground text-xs">to {formatDate(c.endsAt)}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.isActive ? "success" : "secondary"}>
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button size="sm" variant="outline" onClick={() => startEdit(c)}>
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
              ))
            )}
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
