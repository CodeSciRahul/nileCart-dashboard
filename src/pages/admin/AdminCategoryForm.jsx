import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { ButtonLink } from "@/components/ui/button.jsx";
import { CategoryForm } from "@/components/admin/CategoryForm.jsx";
import { CategoryFormGuideSidebar } from "@/components/admin/CategoryFormGuideSidebar.jsx";
import {
  listAdminCategories,
  createAdminCategory,
  updateAdminCategory,
} from "@/services/adminService.js";
import { normalizeStoredImage, serializeStoredImage } from "@/lib/storedImage.js";
import { emptyCategoryForm, flattenCategoryTree } from "@/lib/categoryUtils.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { CATEGORY_GUIDE_STEPS } from "@/constants/categoryForm.js";
import { toast } from "sonner";

function AdminCategoryFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const editId = id || null;
  const isEdit = Boolean(editId);
  const [guideOpen, setGuideOpen] = useState(false);

  const [form, setForm] = useState(() => ({
    ...emptyCategoryForm,
    parent: searchParams.get("parent") || "",
  }));

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: () => listAdminCategories({ tree: "true" }),
  });

  const categoryTree = data?.categories || [];
  const flatCategories = useMemo(() => flattenCategoryTree(categoryTree), [categoryTree]);

  const parentOptions = useMemo(
    () => flatCategories.filter((cat) => !cat.parent && cat._id !== editId),
    [flatCategories, editId]
  );

  useEffect(() => {
    if (!isEdit || isLoading) return;

    const cat = flatCategories.find((c) => c._id === editId);
    if (!cat) return;

    setForm({
      name: cat.name,
      image: normalizeStoredImage(cat.image),
      description: cat.description || "",
      parent: cat.parent?._id || cat.parent || "",
      department: cat.department || "",
      displayOrder: cat.displayOrder ?? 0,
      showInNav: cat.showInNav ?? true,
    });
  }, [isEdit, editId, flatCategories, isLoading]);

  const invalidateCategories = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
  };

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editId ? updateAdminCategory(editId, payload) : createAdminCategory(payload),
    onSuccess: () => {
      toast.success(editId ? "Category updated" : "Category created");
      invalidateCategories();
      navigate("/admin/categories");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      image: serializeStoredImage(form.image),
      description: form.description || undefined,
      parent: form.parent || null,
      displayOrder: Number(form.displayOrder) || 0,
      showInNav: form.showInNav,
    };
    if (!form.parent) {
      payload.department = form.department;
    }
    saveMutation.mutate(payload);
  };

  const handleCancel = () => {
    navigate("/admin/categories");
  };

  const formTitle = isEdit
    ? "Edit category"
    : form.parent
      ? "Create subcategory"
      : "Create department";

  return (
    <DashboardLayout title={isEdit ? "Edit Category" : "Create Category"} variant="admin">
      <div className="w-full">
        <ButtonLink
          variant="ghost"
          size="sm"
          to="/admin/categories"
          className="-ml-2 gap-1.5 text-brand-gray hover:bg-brand-cream/60 hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to all categories
        </ButtonLink>

        <div className="mt-6 w-full">
          {isEdit && isLoading ? (
            <div className="animate-pulse overflow-hidden rounded-xl border border-brand-amber/15 bg-brand-cream/20 p-8">
              <div className="h-6 w-48 rounded-lg bg-brand-cream" />
              <div className="mt-8 space-y-4">
                <div className="h-10 rounded-lg bg-brand-cream" />
                <div className="h-10 rounded-lg bg-brand-cream" />
                <div className="h-10 rounded-lg bg-brand-cream" />
                <div className="h-24 rounded-lg bg-brand-cream" />
              </div>
            </div>
          ) : (
            <CategoryForm
              form={form}
              setForm={setForm}
              editId={editId}
              flatCategories={flatCategories}
              parentOptions={parentOptions}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isPending={saveMutation.isPending}
              title={formTitle}
              onOpenGuide={() => setGuideOpen(true)}
            />
          )}
        </div>
      </div>

      <CategoryFormGuideSidebar
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        isEdit={isEdit}
        steps={CATEGORY_GUIDE_STEPS}
      />
    </DashboardLayout>
  );
}

export default function AdminCategoryForm() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <AdminCategoryFormPage />
    </ProtectedRoute>
  );
}
