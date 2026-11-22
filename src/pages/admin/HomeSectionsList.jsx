import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, LayoutTemplate, Edit3, Trash2, CheckCircle2, XCircle, ArrowUpDown } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Button, ButtonLink } from "@/components/ui/button.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import {
  listHomeSections,
  toggleHomeSectionStatus,
  deleteHomeSection,
} from "@/services/adminService.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { toast } from "sonner";

function HomeSectionsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.homeSections,
    queryFn: listHomeSections,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.homeSections });
  };

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => toggleHomeSectionStatus(id, { isActive }),
    onSuccess: () => {
      toast.success("Section status updated");
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHomeSection,
    onSuccess: () => {
      toast.success("Section removed");
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const sections = data?.sections || [];

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this home section?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <DashboardLayout title="Home Sections" variant="admin">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gray">
            <LayoutTemplate className="size-3.5 text-brand-amber" />
            Storefront sections
          </p>
          <p className="text-sm text-muted-foreground">
            Manage dynamic homepage sections, section images, promotional cards, and product feeds.
          </p>
        </div>
        <ButtonLink to="/admin/sections/new" className="shrink-0 gap-1.5">
          <PlusCircle className="size-4" />
          Create section
        </ButtonLink>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-brand-cream/60" />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <CardContent className="space-y-3">
            <LayoutTemplate className="mx-auto size-10 text-muted-foreground/60" />
            <h3 className="text-base font-semibold">No sections configured</h3>
            <p className="text-sm text-muted-foreground">
              Add section images, promotional cards, or custom grids to customize your storefront.
            </p>
            <ButtonLink to="/admin/sections/new" className="mt-2">
              Add your first section
            </ButtonLink>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sections.map((section) => (
            <div
              key={section._id || section.id || section.key}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-xs transition hover:border-brand-amber/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                {section.image?.url || section.items?.[0]?.image?.url ? (
                  <div className="size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-neutral-100">
                    <img
                      src={section.image?.url || section.items?.[0]?.image?.url}
                      alt={section.title || section.key}
                      className="size-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-neutral-50 text-neutral-400">
                    <LayoutTemplate className="size-6" />
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-foreground text-sm sm:text-base">
                      {section.title || section.key}
                    </span>
                    <span className="rounded bg-brand-cream px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                      {section.type}
                    </span>
                    {section.items?.length > 0 && (
                      <span className="rounded bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 text-[10px] font-bold">
                        {section.items.length} cards
                      </span>
                    )}
                    <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-500">
                      Order: {section.displayOrder ?? 0}
                    </span>
                  </div>
                  {section.subtitle && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{section.subtitle}</p>
                  )}
                  <p className="text-[11px] text-neutral-400">
                    Key: <code className="text-neutral-600">{section.key}</code>
                    {section.ctaLink ? ` • Link: ${section.ctaLink}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    toggleMutation.mutate({
                      id: section._id || section.id,
                      isActive: !section.isActive,
                    })
                  }
                  className="gap-1 text-xs"
                >
                  {section.isActive ? (
                    <>
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="size-3.5 text-neutral-400" />
                      <span className="text-neutral-500">Inactive</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/sections/${section._id || section.id}/edit`)}
                  className="gap-1.5 text-xs"
                >
                  <Edit3 className="size-3.5" />
                  Edit
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(section._id || section.id)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default function HomeSectionsList() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <HomeSectionsListPage />
    </ProtectedRoute>
  );
}

