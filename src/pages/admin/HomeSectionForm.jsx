import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, LayoutTemplate, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Button, ButtonLink } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { ImageUpload } from "@/components/upload/ImageUpload.jsx";
import { UPLOAD_FOLDERS } from "@/constants/uploads.js";
import {
  listHomeSections,
  createHomeSection,
  updateHomeSection,
} from "@/services/adminService.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { toast } from "sonner";

const SECTION_TYPES = [
  { value: "banner", label: "Banner Strip / Card" },
  { value: "grid", label: "Product / Card Grid" },
  { value: "carousel", label: "Carousel" },
  { value: "strip", label: "Horizontal Strip" },
  { value: "popup", label: "Popup Modal" },
];

const PRODUCT_SOURCES = [
  { value: "trending", label: "Trending Products" },
  { value: "new", label: "New Arrivals" },
  { value: "sale", label: "On Sale Deals" },
  { value: "ids", label: "Specific Product IDs" },
];

const emptySectionForm = {
  key: "",
  type: "banner",
  title: "",
  subtitle: "",
  displayOrder: 0,
  isActive: true,
  image: null,
  ctaText: "Shop Now",
  ctaLink: "",
  backgroundColor: "",
  textColor: "",
  config: {
    source: "all_active",
    productSource: "trending",
    layout: "grid",
    limit: 8,
  },
};

function HomeSectionFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(emptySectionForm);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.homeSections,
    queryFn: listHomeSections,
  });

  const sections = data?.sections || [];

  useEffect(() => {
    if (!isEdit || isLoading) return;
    const found = sections.find((s) => s._id === id || s.id === id);
    if (!found) return;

    setForm({
      key: found.key || "",
      type: found.type || "banner",
      title: found.title || "",
      subtitle: found.subtitle || "",
      displayOrder: found.displayOrder ?? 0,
      isActive: found.isActive ?? true,
      image: found.image || null,
      ctaText: found.ctaText || "Shop Now",
      ctaLink: found.ctaLink || "",
      backgroundColor: found.backgroundColor || "",
      textColor: found.textColor || "",
      config: {
        source: found.config?.source || "all_active",
        productSource: found.config?.productSource || "trending",
        layout: found.config?.layout || "grid",
        limit: found.config?.limit || 8,
      },
    });
  }, [isEdit, id, sections, isLoading]);

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? updateHomeSection(id, payload) : createHomeSection(payload),
    onSuccess: () => {
      toast.success(isEdit ? "Section updated" : "Section created");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.homeSections });
      navigate("/admin/sections");
    },
    onError: (err) => toast.error(err.message || "Failed to save section"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.key.trim()) {
      toast.error("Section key is required (e.g. price_tiles, trending_now)");
      return;
    }
    saveMutation.mutate(form);
  };

  return (
    <DashboardLayout
      title={isEdit ? "Edit Home Section" : "Create Home Section"}
      variant="admin"
    >
      <div className="w-full max-w-4xl">
        <ButtonLink
          variant="ghost"
          size="sm"
          to="/admin/sections"
          className="-ml-2 gap-1.5 text-brand-gray hover:bg-brand-cream/60 hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to all sections
        </ButtonLink>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Section Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="key" className="text-sm font-medium">
                    Section Key <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="key"
                    placeholder="e.g. price_tiles, trending_now, clearance_banner"
                    value={form.key}
                    onChange={(e) => setForm({ ...form, key: e.target.value })}
                    disabled={isEdit}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Unique identifier used by the storefront to render this section.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-sm font-medium">
                    Section Type
                  </Label>
                  <select
                    id="type"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    {SECTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. TRENDING NOW, FOR YOU"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="subtitle" className="text-sm font-medium">Subtitle</Label>
                  <Input
                    id="subtitle"
                    placeholder="e.g. Discover our latest contemporary drops"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="displayOrder" className="text-sm font-medium">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ctaText" className="text-sm font-medium">CTA Button Text</Label>
                  <Input
                    id="ctaText"
                    placeholder="Shop Now"
                    value={form.ctaText}
                    onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ctaLink" className="text-sm font-medium">CTA Link</Label>
                  <Input
                    id="ctaLink"
                    placeholder="/shop/tops"
                    value={form.ctaLink}
                    onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Image Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Section Image / Banner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Upload Section Image</Label>
                <ImageUpload
                  value={form.image}
                  onChange={(img) => setForm({ ...form, image: img })}
                  folder={UPLOAD_FOLDERS.marketing}
                />
                <p className="text-xs text-muted-foreground">
                  Upload an image for this section (e.g. promotional banner, tile cover, campaign background).
                </p>
              </div>

              {/* Or manual URL fallback */}
              <div className="space-y-1.5 pt-2">
                <Label htmlFor="imgUrl" className="text-xs text-muted-foreground">
                  Or Direct Image URL
                </Label>
                <Input
                  id="imgUrl"
                  placeholder="https://... or /assets/..."
                  value={form.image?.url || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      image: e.target.value
                        ? { url: e.target.value, alt: form.title || form.key }
                        : null,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Config: Feed & Layout */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Feed & Layout Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Product Source</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    value={form.config?.productSource || "trending"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        config: { ...form.config, productSource: e.target.value },
                      })
                    }
                  >
                    {PRODUCT_SOURCES.map((ps) => (
                      <option key={ps.value} value={ps.value}>
                        {ps.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Items Limit</Label>
                  <Input
                    type="number"
                    min={1}
                    max={48}
                    value={form.config?.limit || 8}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        config: { ...form.config, limit: Number(e.target.value) },
                      })
                    }
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="size-4 rounded border-gray-300 text-brand-amber focus:ring-brand-amber"
                  />
                  <Label htmlFor="isActive" className="text-sm font-semibold cursor-pointer">
                    Section is Active
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-2">
            <ButtonLink variant="outline" to="/admin/sections">
              Cancel
            </ButtonLink>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending
                ? "Saving..."
                : isEdit
                ? "Update Section"
                : "Create Section"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function HomeSectionForm() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <HomeSectionFormPage />
    </ProtectedRoute>
  );
}

