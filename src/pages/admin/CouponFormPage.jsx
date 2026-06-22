import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { ButtonLink } from "@/components/ui/button.jsx";
import { CouponForm } from "@/components/admin/CouponForm.jsx";
import { CouponFormGuideSidebar } from "@/components/admin/CouponFormGuideSidebar.jsx";
import {
  listCoupons,
  createCoupon,
  updateCoupon,
  listAdminCategories,
  searchProducts,
} from "@/services/adminService.js";
import { useDebouncedValue } from "@/hooks/useDebouncedValue.js";
import {
  buildCouponPayload,
  couponToForm,
  couponToSelectedProducts,
  emptyCouponForm,
} from "@/lib/couponUtils.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { COUPON_GUIDE_STEPS, COUPON_GUIDE_TIPS } from "@/constants/couponForm.js";
import { toast } from "sonner";

function CouponFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const editId = id || null;
  const isEdit = Boolean(editId);
  const [guideOpen, setGuideOpen] = useState(false);

  const [form, setForm] = useState(emptyCouponForm);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productQuery, setProductQuery] = useState("");
  const [productResults, setProductResults] = useState([]);
  const debouncedProductQuery = useDebouncedValue(productQuery, 300);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.coupons,
    queryFn: listCoupons,
  });

  const { data: categoriesData } = useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: () => listAdminCategories({ tree: "true" }),
  });

  const categoryTree = categoriesData?.categories || [];
  const coupons = data?.coupons || [];

  useEffect(() => {
    if (!isEdit || isLoading) return;

    const coupon = coupons.find((c) => c._id === editId);
    if (!coupon) return;

    setForm(couponToForm(coupon));
    setSelectedProducts(couponToSelectedProducts(coupon));
    setProductQuery("");
    setProductResults([]);
  }, [isEdit, editId, coupons, isLoading]);

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

  const saveMutation = useMutation({
    mutationFn: (payload) => (editId ? updateCoupon(editId, payload) : createCoupon(payload)),
    onSuccess: () => {
      toast.success(editId ? "Coupon updated" : "Coupon created");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.coupons });
      navigate("/admin/coupons");
    },
    onError: (err) => toast.error(err.message || "Failed to save coupon"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const payload = buildCouponPayload(form, selectedProducts);
      saveMutation.mutate(payload);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const addProduct = (product) => {
    if (selectedProducts.some((p) => p._id === product._id)) return;
    setSelectedProducts((prev) => [...prev, { _id: product._id, title: product.title }]);
  };

  const removeProduct = (productId) => {
    setSelectedProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  const handleCancel = () => {
    navigate("/admin/coupons");
  };

  return (
    <DashboardLayout title={isEdit ? "Edit Coupon" : "Create Coupon"} variant="admin">
      <div className="w-full">
        <ButtonLink
          variant="ghost"
          size="sm"
          to="/admin/coupons"
          className="-ml-2 gap-1.5 text-brand-gray hover:bg-brand-cream/60 hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to all coupons
        </ButtonLink>

        <div className="mt-6 w-full">
          {isEdit && isLoading ? (
            <div className="animate-pulse overflow-hidden rounded-xl border border-brand-amber/15 bg-brand-cream/20 p-8">
              <div className="h-6 w-48 rounded-lg bg-brand-cream" />
              <div className="mt-8 space-y-4">
                <div className="h-10 rounded-lg bg-brand-cream" />
                <div className="h-10 rounded-lg bg-brand-cream" />
                <div className="h-24 rounded-lg bg-brand-cream" />
              </div>
            </div>
          ) : (
            <CouponForm
              form={form}
              setForm={setForm}
              editId={editId}
              categoryTree={categoryTree}
              productQuery={productQuery}
              setProductQuery={setProductQuery}
              productResults={productResults}
              selectedProducts={selectedProducts}
              onAddProduct={addProduct}
              onRemoveProduct={removeProduct}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isPending={saveMutation.isPending}
              onOpenGuide={() => setGuideOpen(true)}
            />
          )}
        </div>
      </div>

      <CouponFormGuideSidebar
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        isEdit={isEdit}
        steps={COUPON_GUIDE_STEPS}
        tips={COUPON_GUIDE_TIPS}
      />
    </DashboardLayout>
  );
}

export default function AdminCouponForm() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <CouponFormPage />
    </ProtectedRoute>
  );
}
