import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, LayoutTemplate, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { Button, ButtonLink } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
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
  { value: "special_offers", label: "Special Offers (4 Price Tiles)" },
  { value: "trending_cards", label: "Trending Now (4 Cards)" },
  { value: "promotional_campaign", label: "Promotional Banner (Full-Width)" },
  { value: "hero_banner", label: "Hero Banner Carousel" },
  { value: "recommended_products", label: "Product Grid (e.g. FOR YOU)" },
  { value: "category_highlights", label: "Category Highlights" },
  { value: "custom_marketing", label: "Custom Marketing / Brand Statement" },
  { value: "banner", label: "Standard Banner" },
  { value: "grid", label: "Generic Grid" },
];

const PRODUCT_SOURCES = [
  { value: "all", label: "All Active Products" },
  { value: "trending", label: "Trending Products" },
  { value: "new", label: "New Arrivals" },
  { value: "sale", label: "On Sale Deals" },
  { value: "ids", label: "Specific Product IDs" },
];

const emptySectionForm = {
  key: "",
  type: "promotional_campaign",
  title: "",
  subtitle: "",
  displayOrder: 0,
  isActive: true,
  image: null,
  ctaText: "Shop Now",
  ctaLink: "",
  backgroundColor: "",
  textColor: "",
  items: [],
  config: {
    source: "all_active",
    productSource: "all",
    layout: "grid",
    limit: 12,
  },
};

export default function HomeSectionForm() {
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
      type: found.type || "promotional_campaign",
      title: found.title || "",
      subtitle: found.subtitle || "",
      displayOrder: found.displayOrder ?? 0,
      isActive: found.isActive ?? true,
      image: found.image || null,
      ctaText: found.ctaText || "Shop Now",
      ctaLink: found.ctaLink || "",
      backgroundColor: found.backgroundColor || "",
      textColor: found.textColor || "",
      items: Array.isArray(found.items)
        ? found.items.map((it) => ({
            _id: it._id,
            title: it.title || "",
            subtitle: it.subtitle || "",
            caption: it.caption || "",
            kicker: it.kicker || "",
            price: it.price || "",
            link: it.link || "",
            displayOrder: it.displayOrder ?? 0,
            image: it.image || null,
          }))
        : [],
      config: {
        source: found.config?.source || "all_active",
        productSource: found.config?.productSource || "all",
        layout: found.config?.layout || "grid",
        limit: found.config?.limit || 12,
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
      toast.error("Section key is required (e.g. special-offers, bestsellers-banner)");
      return;
    }
    saveMutation.mutate(form);
  };

  const handleAddItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          title: "",
          subtitle: "",
          caption: "",
          kicker: "",
          price: "",
          link: "/shop/all",
          displayOrder: prev.items.length + 1,
          image: null,
        },
      ],
    }));
  };

  const handleUpdateItem = (index, field, value) => {
    setForm((prev) => {
      const nextItems = [...prev.items];
      nextItems[index] = { ...nextItems[index], [field]: value };
      return { ...prev, items: nextItems };
    });
  };

  const handleRemoveItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  return (
    <DashboardLayout
      title={isEdit ? "Edit Storefront Section" : "Create Storefront Section"}
      variant="admin"
    >
      <div className="w-full max-w-4xl pb-12">
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
          {/* 1. Basic Section Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Section Details & Header</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="key" className="text-sm font-medium">
                    Section Key <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="key"
                    placeholder="e.g. special-offers, bestsellers-banner, trending-now"
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

              {form.type === "hero_banner" ? (
                <div className="rounded-lg border border-brand-amber/25 bg-brand-cream/40 p-4 text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">Clean Hero Presentation:</span> Text overlay options are disabled for Hero Banners. Campaign images are displayed full-bleed edge-to-edge. Clicking on the banner will redirect users to the link specified below.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Section Header / Title Text
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g. SPECIAL OFFER, Hot right now. Best Sellers., TRENDING NOW"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subtitle" className="text-sm font-medium">
                      Subtitle / Eyebrow Text
                    </Label>
                    <Input
                      id="subtitle"
                      placeholder="e.g. FROM ₹390, NEW ARRIVALS, 20-60% OFF"
                      value={form.subtitle}
                      onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="displayOrder" className="text-sm font-medium">
                    Display Order
                  </Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                  />
                </div>

                {form.type !== "hero_banner" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="ctaText" className="text-sm font-medium">
                      CTA Button Text
                    </Label>
                    <Input
                      id="ctaText"
                      placeholder="SHOP NOW or SHOP CLEARANCE >"
                      value={form.ctaText}
                      onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="ctaLink" className="text-sm font-medium">
                    {form.type === "hero_banner" ? "Hero Banner Click Redirect Link" : "CTA Button Link"}
                  </Label>
                  <Input
                    id="ctaLink"
                    placeholder="/shop/all"
                    value={form.ctaLink}
                    onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="size-4 rounded border-gray-300 text-brand-amber focus:ring-brand-amber cursor-pointer"
                />
                <Label htmlFor="isActive" className="text-sm font-semibold cursor-pointer">
                  Section is Visible / Active on Storefront
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* 2. Main Section Banner Image (For Banners, Backgrounds) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Section Banner Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Upload Banner Image</Label>
                <ImageUpload
                  value={form.image}
                  onChange={(img) => setForm({ ...form, image: img })}
                  folder={UPLOAD_FOLDERS.marketing}
                />
                <p className="text-xs text-muted-foreground">
                  Upload an image for this section (e.g. Best Sellers banner, Clearance banner, New Arrivals).
                </p>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label htmlFor="imgUrl" className="text-xs text-muted-foreground">
                  Or Direct Image URL / Path
                </Label>
                <Input
                  id="imgUrl"
                  placeholder="https://... or /images/sections/..."
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

          {/* 3. Section Items / Cards Manager (For Special Offers 4 Tiles, Trending Now 4 Cards) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Section Cards / Tiles</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage individual cards, prices, titles, and images for multi-card sections.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="gap-1.5"
              >
                <Plus className="size-3.5" />
                Add Card
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.items.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  No individual cards added for this section. If this is a banner section (e.g. Best Sellers), use the Section Banner Image above. For 4-card sections (Special Offers, Trending Now), click &quot;Add Card&quot; to configure tiles.
                </div>
              ) : (
                <div className="space-y-4">
                  {form.items.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="rounded-lg border border-border bg-card p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-xs font-bold text-foreground">
                          Card #{index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          className="size-8 p-0 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Card Title / Caption</Label>
                          <Input
                            placeholder="e.g. Accessories & Jewellery, Dark Romance"
                            value={item.caption || item.title || ""}
                            onChange={(e) => {
                              handleUpdateItem(index, "caption", e.target.value);
                              handleUpdateItem(index, "title", e.target.value);
                            }}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Kicker / Top Label</Label>
                          <Input
                            placeholder="e.g. STARTING AT, FROM, UNDER"
                            value={item.kicker || ""}
                            onChange={(e) => handleUpdateItem(index, "kicker", e.target.value)}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Price / Highlight</Label>
                          <Input
                            placeholder="e.g. ₹90, ₹590, ₹890"
                            value={item.price || ""}
                            onChange={(e) => handleUpdateItem(index, "price", e.target.value)}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Link / Category Path</Label>
                          <Input
                            placeholder="/shop/accessories"
                            value={item.link || ""}
                            onChange={(e) => handleUpdateItem(index, "link", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <Label className="text-xs font-medium">Card Image</Label>
                        <div className="flex flex-col sm:flex-row gap-3 items-start">
                          <div className="w-full sm:w-1/2">
                            <ImageUpload
                              value={item.image}
                              onChange={(img) => handleUpdateItem(index, "image", img)}
                              folder={UPLOAD_FOLDERS.marketing}
                            />
                          </div>
                          <div className="w-full sm:w-1/2 space-y-1">
                            <Label className="text-[11px] text-muted-foreground">
                              Or Direct Image URL / Path
                            </Label>
                            <Input
                              placeholder="/images/sections/... or https://..."
                              value={item.image?.url || ""}
                              onChange={(e) =>
                                handleUpdateItem(index, "image", e.target.value ? { url: e.target.value } : null)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
