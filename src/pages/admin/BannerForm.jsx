import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { ButtonLink } from "@/components/ui/button.jsx";
import { BannerForm } from "@/components/admin/BannerForm.jsx";
import { AnnouncementFormGuideSidebar } from "@/components/admin/AnnouncementFormGuideSidebar.jsx";
import {
  listBanners,
  createBanner,
  updateBanner,
} from "@/services/adminService.js";
import {
  buildBannerPayload,
  bannerFromApi,
  emptyBannerForm,
} from "@/lib/bannerUtils.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { BANNER_GUIDE_STEPS } from "@/constants/marketing.js";
import { toast } from "sonner";

function BannerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const editId = id || null;
  const isEdit = Boolean(editId);
  const [guideOpen, setGuideOpen] = useState(false);
  const [form, setForm] = useState(emptyBannerForm);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.banners,
    queryFn: listBanners,
  });

  const banners = data?.banners || [];

  useEffect(() => {
    if (!isEdit || isLoading) return;
    const banner = banners.find((b) => b._id === editId);
    if (!banner) return;
    setForm(bannerFromApi(banner));
  }, [isEdit, editId, banners, isLoading]);

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editId ? updateBanner(editId, payload) : createBanner(payload),
    onSuccess: () => {
      toast.success(editId ? "Banner updated" : "Banner created");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.banners });
      navigate("/admin/banners");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!form.image) {
      toast.error("Desktop banner image is required.");
      return;
    }
    saveMutation.mutate(buildBannerPayload(form));
  };

  return (
    <DashboardLayout
      title={isEdit ? "Edit Banner" : "Create Banner"}
      variant="admin"
    >
      <div className="w-full">
        <ButtonLink
          variant="ghost"
          size="sm"
          to="/admin/banners"
          className="-ml-2 gap-1.5 text-brand-gray hover:bg-brand-cream/60 hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to all banners
        </ButtonLink>

        <div className="mt-6 w-full">
          {isEdit && isLoading ? (
            <div className="animate-pulse overflow-hidden rounded-xl border border-brand-amber/15 bg-brand-cream/20 p-8">
              <div className="h-6 w-48 rounded-lg bg-brand-cream" />
              <div className="mt-8 space-y-4">
                <div className="h-24 rounded-lg bg-brand-cream" />
                <div className="h-10 rounded-lg bg-brand-cream" />
              </div>
            </div>
          ) : (
            <BannerForm
              form={form}
              setForm={setForm}
              isEdit={isEdit}
              onSubmit={handleSubmit}
              onCancel={() => navigate("/admin/banners")}
              isPending={saveMutation.isPending}
              onOpenGuide={() => setGuideOpen(true)}
            />
          )}
        </div>
      </div>

      <AnnouncementFormGuideSidebar
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        isEdit={isEdit}
        steps={BANNER_GUIDE_STEPS}
        eyebrow={isEdit ? "Update banner" : "New banner"}
        title={isEdit ? "Refine your campaign" : "Launch a visual campaign"}
        intro="Banners power the NileCart homepage hero and promotional placements. Schedule and target them so marketing goes live without code changes."
      />
    </DashboardLayout>
  );
}

export default function AdminBannerForm() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <BannerFormPage />
    </ProtectedRoute>
  );
}
