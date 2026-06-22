import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { ButtonLink } from "@/components/ui/button.jsx";
import { CouponCatalog } from "@/components/admin/CouponCatalog.jsx";
import { listCoupons, toggleCouponStatus } from "@/services/adminService.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { toast } from "sonner";

function CouponsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.coupons,
    queryFn: listCoupons,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => toggleCouponStatus(id, { isActive }),
    onSuccess: () => {
      toast.success("Coupon status updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.coupons });
    },
    onError: (err) => toast.error(err.message || "Failed to update status"),
  });

  const coupons = data?.coupons || [];

  return (
    <DashboardLayout title="All Coupons" variant="admin">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gray">
            <Sparkles className="size-3.5 text-brand-amber" />
            Platform discounts
          </p>
          <p className="text-sm text-muted-foreground">
            Manage coupon codes customers can apply at checkout on the NileCart storefront.
          </p>
        </div>
        <ButtonLink to="/admin/coupons/new" className="shrink-0 gap-1.5">
          <PlusCircle className="size-4" />
          Create coupon
        </ButtonLink>
      </div>

      <CouponCatalog
        coupons={coupons}
        isLoading={isLoading}
        onEdit={(id) => navigate(`/admin/coupons/${id}/edit`)}
        onToggle={(payload) => toggleMutation.mutate(payload)}
        isToggling={toggleMutation.isPending}
      />
    </DashboardLayout>
  );
}

export default function CouponsList() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <CouponsListPage />
    </ProtectedRoute>
  );
}
