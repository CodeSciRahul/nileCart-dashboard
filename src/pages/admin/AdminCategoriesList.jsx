import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { ButtonLink } from "@/components/ui/button.jsx";
import { CategoryCatalog } from "@/components/admin/CategoryCatalog.jsx";
import {
  listAdminCategories,
  updateAdminCategory,
  deleteAdminCategory,
} from "@/services/adminService.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { toast } from "sonner";

function AdminCategoriesListPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: () => listAdminCategories({ tree: "true" }),
  });

  const invalidateCategories = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
  };

  const deleteMutation = useMutation({
    mutationFn: deleteAdminCategory,
    onSuccess: () => {
      toast.success("Category deactivated");
      invalidateCategories();
    },
    onError: (err) => toast.error(err.message),
  });

  const activateMutation = useMutation({
    mutationFn: (id) => updateAdminCategory(id, { isActive: true }),
    onSuccess: () => {
      toast.success("Category activated");
      invalidateCategories();
    },
    onError: (err) => toast.error(err.message),
  });

  const categoryTree = data?.categories || [];

  return (
    <DashboardLayout title="All Categories" variant="admin">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gray">
            <Sparkles className="size-3.5 text-brand-amber" />
            Category catalog
          </p>
          <p className="text-sm text-muted-foreground">
            Browse departments and subcategories in your storefront catalog. Sellers assign
            products to subcategories from this tree.
          </p>
        </div>
        <ButtonLink to="/admin/categories/new" className="shrink-0 gap-1.5">
          <PlusCircle className="size-4" />
          Create category
        </ButtonLink>
      </div>

      <CategoryCatalog
        categoryTree={categoryTree}
        isLoading={isLoading}
        onDeactivate={(id) => deleteMutation.mutate(id)}
        onActivate={(id) => activateMutation.mutate(id)}
        isActivating={activateMutation.isPending}
      />
    </DashboardLayout>
  );
}

export default function AdminCategoriesList() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <AdminCategoriesListPage />
    </ProtectedRoute>
  );
}
