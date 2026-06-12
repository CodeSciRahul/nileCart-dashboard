import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
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
  listBanners,
  createBanner,
  updateBanner,
  toggleBannerStatus,
  deleteBanner,
} from "@/services/adminService.js";
import { ImageUpload } from "@/components/upload/ImageUpload.jsx";
import { UPLOAD_FOLDERS } from "@/lib/uploadConstants.js";
import { normalizeStoredImage } from "@/lib/storedImage.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { toast } from "sonner";

const emptyForm = {
  title: "",
  subtitle: "",
  image: null,
  ctaText: "Shop Now",
  ctaLink: "",
  displayOrder: "0",
};

function BannersPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.banners,
    queryFn: listBanners,
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => (editId ? updateBanner(editId, payload) : createBanner(payload)),
    onSuccess: () => {
      toast.success(editId ? "Banner updated" : "Banner created");
      setForm(emptyForm);
      setEditId(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.banners });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => toggleBannerStatus(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.banners }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      toast.success("Banner removed");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.banners });
    },
  });

  const banners = data?.banners || [];

  return (
    <DashboardLayout title="Banners" variant="admin">
      <Card className="mb-6 max-w-xl">
        <CardHeader>
          <CardTitle>{editId ? "Edit banner" : "Create banner"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.image) {
                toast.error("Banner image is required.");
                return;
              }
              saveMutation.mutate({
                ...form,
                displayOrder: Number(form.displayOrder) || 0,
              });
            }}
            className="space-y-3"
          >
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <ImageUpload
              label="Banner image *"
              folder={UPLOAD_FOLDERS.PLATFORM_BANNERS}
              value={form.image}
              onChange={(image) => setForm((f) => ({ ...f, image }))}
            />
            <div className="space-y-1">
              <Label>Subtitle</Label>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>CTA text</Label>
                <Input
                  value={form.ctaText}
                  onChange={(e) => setForm((f) => ({ ...f, ctaText: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>CTA link</Label>
                <Input
                  value={form.ctaLink}
                  onChange={(e) => setForm((f) => ({ ...f, ctaLink: e.target.value }))}
                />
              </div>
            </div>
            <Button type="submit" disabled={saveMutation.isPending}>
              {editId ? "Update" : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.map((b) => (
              <TableRow key={b._id}>
                <TableCell>{b.title}</TableCell>
                <TableCell>{b.displayOrder}</TableCell>
                <TableCell>
                  <Badge variant={b.isActive ? "success" : "secondary"}>
                    {b.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditId(b._id);
                      setForm({
                        title: b.title,
                        subtitle: b.subtitle || "",
                        image: normalizeStoredImage(b.image),
                        ctaText: b.ctaText || "Shop Now",
                        ctaLink: b.ctaLink || "",
                        displayOrder: String(b.displayOrder ?? 0),
                      });
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleMutation.mutate({ id: b._id, isActive: !b.isActive })}
                  >
                    {b.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(b._id)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DashboardLayout>
  );
}

export default function Banners() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <BannersPage />
    </ProtectedRoute>
  );
}
