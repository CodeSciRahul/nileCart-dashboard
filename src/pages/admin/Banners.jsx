import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { ButtonLink } from "@/components/ui/button.jsx";
import { BannerCatalog } from "@/components/admin/BannerCatalog.jsx";
import {
  listBanners,
  toggleBannerStatus,
  deleteBanner,
  reorderBanners,
} from "@/services/adminService.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { toast } from "sonner";

function BannersListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.banners,
    queryFn: listBanners,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.banners });
  };

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => toggleBannerStatus(id, { isActive }),
    onSuccess: () => invalidate(),
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      toast.success("Banner deactivated");
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const reorderMutation = useMutation({
    mutationFn: (items) => reorderBanners({ items }),
    onSuccess: () => {
      toast.success("Order updated");
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const banners = data?.banners || [];

  const handleDelete = (id) => {
    if (window.confirm("Deactivate this banner?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <DashboardLayout title="Banners" variant="admin">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gray">
            <Sparkles className="size-3.5 text-brand-amber" />
            Storefront marketing
          </p>
          <p className="text-sm text-muted-foreground">
            Create, schedule, reorder, and publish banners for the homepage hero and campaigns.
          </p>
        </div>
        <ButtonLink to="/admin/banners/new" className="shrink-0 gap-1.5">
          <PlusCircle className="size-4" />
          Create banner
        </ButtonLink>
      </div>

      <BannerCatalog
        banners={banners}
        isLoading={isLoading}
        onEdit={(id) => navigate(`/admin/banners/${id}/edit`)}
        onToggle={(payload) => toggleMutation.mutate(payload)}
        onDelete={handleDelete}
        onReorder={(items) => reorderMutation.mutate(items)}
        isToggling={toggleMutation.isPending}
      />
    </DashboardLayout>
  );
}

export default function Banners() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <BannersListPage />
    </ProtectedRoute>
  );
}
