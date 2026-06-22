import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { ButtonLink } from "@/components/ui/button.jsx";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm.jsx";
import { AnnouncementFormGuideSidebar } from "@/components/admin/AnnouncementFormGuideSidebar.jsx";
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
} from "@/services/adminService.js";
import {
  buildAnnouncementPayload,
  emptyAnnouncementForm,
  toDatetimeLocal,
} from "@/lib/announcementUtils.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { ANNOUNCEMENT_GUIDE_STEPS } from "@/constants/announcementForm.js";
import { toast } from "sonner";

function AnnouncementFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const editId = id || null;
  const isEdit = Boolean(editId);
  const [guideOpen, setGuideOpen] = useState(false);
  const [form, setForm] = useState(emptyAnnouncementForm);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.announcements,
    queryFn: listAnnouncements,
  });

  const announcements = data?.announcements || [];

  useEffect(() => {
    if (!isEdit || isLoading) return;

    const announcement = announcements.find((a) => a._id === editId);
    if (!announcement) return;

    setForm({
      message: announcement.message || "",
      backgroundColor: announcement.backgroundColor || "",
      textColor: announcement.textColor || "",
      priority: String(announcement.priority ?? 0),
      startsAt: toDatetimeLocal(announcement.startsAt),
      endsAt: toDatetimeLocal(announcement.endsAt),
      isActive: announcement.isActive ?? true,
    });
  }, [isEdit, editId, announcements, isLoading]);

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editId ? updateAnnouncement(editId, payload) : createAnnouncement(payload),
    onSuccess: () => {
      toast.success(editId ? "Announcement updated" : "Announcement created");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.announcements });
      navigate("/admin/announcements");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.message.trim()) {
      toast.error("Message is required.");
      return;
    }
    saveMutation.mutate(buildAnnouncementPayload(form));
  };

  const handleCancel = () => {
    navigate("/admin/announcements");
  };

  return (
    <DashboardLayout
      title={isEdit ? "Edit Announcement" : "Create Announcement"}
      variant="admin"
    >
      <div className="w-full">
        <ButtonLink
          variant="ghost"
          size="sm"
          to="/admin/announcements"
          className="-ml-2 gap-1.5 text-brand-gray hover:bg-brand-cream/60 hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to all announcements
        </ButtonLink>

        <div className="mt-6 w-full">
          {isEdit && isLoading ? (
            <div className="animate-pulse overflow-hidden rounded-xl border border-brand-amber/15 bg-brand-cream/20 p-8">
              <div className="h-6 w-48 rounded-lg bg-brand-cream" />
              <div className="mt-8 space-y-4">
                <div className="h-24 rounded-lg bg-brand-cream" />
                <div className="h-10 rounded-lg bg-brand-cream" />
                <div className="h-10 rounded-lg bg-brand-cream" />
              </div>
            </div>
          ) : (
            <AnnouncementForm
              form={form}
              setForm={setForm}
              isEdit={isEdit}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
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
        steps={ANNOUNCEMENT_GUIDE_STEPS}
        eyebrow={isEdit ? "Update announcement" : "New announcement"}
        title={isEdit ? "Refine your banner" : "Reach your customers"}
        intro="Announcements appear as banner messages on the NileCart storefront. Use them for promotions, welcome messages, or important updates."
      />
    </DashboardLayout>
  );
}

export default function AdminAnnouncementForm() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <AnnouncementFormPage />
    </ProtectedRoute>
  );
}
