import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { ButtonLink } from "@/components/ui/button.jsx";
import { AnnouncementCatalog } from "@/components/admin/AnnouncementCatalog.jsx";
import {
  listAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} from "@/services/adminService.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { toast } from "sonner";

function AnnouncementsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.announcements,
    queryFn: listAnnouncements,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.announcements });
  };

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => updateAnnouncement(id, { isActive }),
    onSuccess: () => invalidate(),
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      toast.success("Announcement deleted");
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const announcements = data?.announcements || [];

  const handleDelete = (id) => {
    if (window.confirm("Delete this announcement?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <DashboardLayout title="All Announcements" variant="admin">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gray">
            <Sparkles className="size-3.5 text-brand-amber" />
            Storefront banners
          </p>
          <p className="text-sm text-muted-foreground">
            Manage announcement bars shown to customers on the NileCart storefront.
          </p>
        </div>
        <ButtonLink to="/admin/announcements/new" className="shrink-0 gap-1.5">
          <PlusCircle className="size-4" />
          Create announcement
        </ButtonLink>
      </div>

      <AnnouncementCatalog
        announcements={announcements}
        isLoading={isLoading}
        onEdit={(id) => navigate(`/admin/announcements/${id}/edit`)}
        onToggle={(payload) => toggleMutation.mutate(payload)}
        onDelete={handleDelete}
        isToggling={toggleMutation.isPending}
      />
    </DashboardLayout>
  );
}

export default function AnnouncementsList() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <AnnouncementsListPage />
    </ProtectedRoute>
  );
}
