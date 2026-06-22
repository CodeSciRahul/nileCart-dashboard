import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ImageIcon,
  Layers,
  Package,
  Plus,
  Sparkles,
  Tag,
  Type,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Select } from "@/components/ui/table.jsx";
import {
  Field,
  FormSection,
  GenderPills,
  ProductFormHero,
  ProductPreviewPanel,
  TagsInput,
  VariantCard,
} from "@/components/seller/ProductFormUI.jsx";
import { ProductFormGuideSidebar } from "@/components/seller/ProductFormGuideSidebar.jsx";
import { createProduct, getMyProducts, updateProduct } from "@/services/productService.js";
import { getCategories } from "@/services/categoryService.js";
import { ImageUpload } from "@/components/upload/ImageUpload.jsx";
import { UPLOAD_FOLDERS } from "@/constants/uploads.js";
import { normalizeStoredImages } from "@/lib/storedImage.js";
import {
  buildProductPayload,
  createVariant,
  flattenCategoryOptions,
  mapProductVariant,
} from "@/lib/productUtils.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { toast } from "sonner";

function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [guideOpen, setGuideOpen] = useState(false);

  const { data: categoriesData } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => getCategories({ tree: "true" }),
  });

  const categoryOptions = useMemo(
    () => flattenCategoryOptions(categoriesData?.categories || []),
    [categoriesData]
  );

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: queryKeys.seller.products({}),
    queryFn: getMyProducts,
    enabled: isEdit,
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    gender: "Women",
    images: [],
    tags: [],
    variants: [createVariant()],
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (isEdit && productsData?.products) {
      const product = productsData.products.find((p) => p._id === id);
      if (product) {
        const variants =
          product.variants?.length > 0
            ? product.variants.map(mapProductVariant)
            : [createVariant()];

        setForm({
          title: product.title,
          description: product.description || "",
          category: product.category?._id || product.category || "",
          gender: product.gender || "Women",
          images: normalizeStoredImages(product.images),
          tags: product.tags || [],
          variants,
        });
      }
    }
  }, [isEdit, id, productsData]);

  const categoryLabel = useMemo(
    () => categoryOptions.find((c) => c._id === form.category)?.label || "",
    [categoryOptions, form.category]
  );

  const mutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? updateProduct(id, payload) : createProduct(payload),
    onSuccess: () => {
      toast.success(isEdit ? "Product updated" : "Product created");
      navigate("/seller/products");
    },
    onError: (err) => toast.error(err.message),
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const updateVariant = (index, field, value) => {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((variant, i) =>
        i === index
          ? {
              ...variant,
              [field]: ["stock", "price", "mrp"].includes(field) ? Number(value) || 0 : value,
            }
          : variant
      ),
    }));
  };

  const addVariant = () => {
    setForm((f) => ({
      ...f,
      variants: [...f.variants, createVariant()],
    }));
  };

  const removeVariant = (index) => {
    setForm((f) => {
      if (f.variants.length <= 1) return f;
      return {
        ...f,
        variants: f.variants.filter((_, i) => i !== index),
      };
    });
  };

  const addTag = (raw) => {
    const value = raw.trim();
    if (!value) return;

    setForm((f) => {
      const exists = f.tags.some((tag) => tag.toLowerCase() === value.toLowerCase());
      if (exists) return f;
      return { ...f, tags: [...f.tags, value] };
    });
    setTagInput("");
  };

  const removeTag = (index) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.filter((_, i) => i !== index),
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const validateVariants = () => {
    const skus = new Set();

    for (let i = 0; i < form.variants.length; i += 1) {
      const variant = form.variants[i];
      const label = `Variant ${i + 1}`;

      if (!variant.sku.trim()) {
        toast.error(`${label}: SKU is required.`);
        return false;
      }

      if (skus.has(variant.sku.trim().toLowerCase())) {
        toast.error(`Duplicate SKU "${variant.sku}" — each variant must have a unique SKU.`);
        return false;
      }
      skus.add(variant.sku.trim().toLowerCase());

      if (!variant.price || variant.price <= 0) {
        toast.error(`${label}: Price must be greater than 0.`);
        return false;
      }

      if (!variant.mrp || variant.mrp <= 0) {
        toast.error(`${label}: MRP must be greater than 0.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateVariants()) {
      return;
    }

    mutation.mutate(buildProductPayload(form));
  };

  if (isEdit && productsLoading) {
    return (
      <DashboardLayout title="Edit product" variant="seller">
        <div className="mx-auto max-w-5xl animate-pulse space-y-6">
          <div className="h-24 rounded-2xl bg-brand-cream/30" />
          <div className="h-96 rounded-xl bg-brand-cream/20" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={isEdit ? "Edit product" : "New product"} variant="seller">
      <div className="mx-auto max-w-5xl space-y-6">
        <ProductFormHero
          isEdit={isEdit}
          title={form.title}
          onOpenGuide={() => setGuideOpen(true)}
        />

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
            <div className="space-y-6">
              <div className="xl:hidden">
                <ProductPreviewPanel form={form} categoryLabel={categoryLabel} />
              </div>

              <FormSection
                step={1}
                icon={Type}
                title="Basic details"
                description="Title and description shown on your product page."
              >
                <Field label="Title" required>
                  <Input
                    value={form.title}
                    onChange={set("title")}
                    required
                    placeholder="e.g. Women's Black Puff Sleeve Top"
                  />
                </Field>
                <Field label="Description" hint="Fabric, fit, care instructions, and sizing notes.">
                  <Textarea
                    value={form.description}
                    onChange={set("description")}
                    placeholder="Describe your product for shoppers..."
                    className="min-h-24"
                  />
                </Field>
              </FormSection>

              <FormSection
                step={2}
                icon={Layers}
                title="Category & audience"
                description="Where shoppers will find this product."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Category" required>
                    <Select value={form.category} onChange={set("category")} required>
                      <option value="">Select category</option>
                      {categoryOptions.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Gender">
                    <GenderPills
                      value={form.gender}
                      onChange={(gender) => setForm((f) => ({ ...f, gender }))}
                    />
                  </Field>
                </div>
              </FormSection>

              <FormSection
                step={3}
                icon={ImageIcon}
                title="Product images"
                description="First image is used as the cover in listings."
              >
                <div className="rounded-xl border border-brand-amber/15 bg-brand-cream/20 p-4">
                  <ImageUpload
                    label="Product images"
                    folder={UPLOAD_FOLDERS.PRODUCTS}
                    multiple
                    value={form.images}
                    onChange={(images) => setForm((f) => ({ ...f, images }))}
                    helperText="Upload JPEG, PNG, or WEBP. Images are stored directly in S3."
                  />
                </div>
              </FormSection>

              <FormSection
                step={4}
                icon={Tag}
                title="Tags"
                description="Keywords that help with search and filtering."
              >
                <TagsInput
                  tags={form.tags}
                  tagInput={tagInput}
                  onTagInputChange={setTagInput}
                  onAddTag={addTag}
                  onRemoveTag={removeTag}
                  onKeyDown={handleTagKeyDown}
                />
              </FormSection>

              <FormSection
                step={5}
                icon={Package}
                title="Variants"
                description="One row per size, color, or SKU combination."
                action={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVariant}
                    className="shrink-0 border-brand-amber/25"
                  >
                    <Plus className="mr-1 size-4" />
                    Add variant
                  </Button>
                }
              >
                <div className="space-y-4">
                  {form.variants.map((variant, index) => (
                    <VariantCard
                      key={variant.key}
                      variant={variant}
                      index={index}
                      canRemove={form.variants.length > 1}
                      onRemove={removeVariant}
                    >
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Field label="SKU" required>
                          <Input
                            value={variant.sku}
                            onChange={(e) => updateVariant(index, "sku", e.target.value)}
                            placeholder="e.g. TOP-001-M-RED"
                            required
                            className="font-mono text-sm"
                          />
                        </Field>
                        <Field label="Size">
                          <Input
                            value={variant.size}
                            onChange={(e) => updateVariant(index, "size", e.target.value)}
                            placeholder="e.g. M"
                          />
                        </Field>
                        <Field label="Color">
                          <Input
                            value={variant.color}
                            onChange={(e) => updateVariant(index, "color", e.target.value)}
                            placeholder="e.g. Red"
                          />
                        </Field>
                        <Field label="Stock">
                          <Input
                            type="number"
                            min={0}
                            value={variant.stock}
                            onChange={(e) => updateVariant(index, "stock", e.target.value)}
                          />
                        </Field>
                        <Field label="Price" required hint="Selling price customers pay.">
                          <Input
                            type="number"
                            min={0}
                            value={variant.price}
                            onChange={(e) => updateVariant(index, "price", e.target.value)}
                            required
                          />
                        </Field>
                        <Field label="MRP" required hint="Original price before discount.">
                          <Input
                            type="number"
                            min={0}
                            value={variant.mrp}
                            onChange={(e) => updateVariant(index, "mrp", e.target.value)}
                            required
                          />
                        </Field>
                        <div className="md:col-span-2 lg:col-span-3">
                          <div className="rounded-xl border border-brand-amber/15 bg-brand-cream/20 p-4">
                            <ImageUpload
                              label={`Variant ${index + 1} images`}
                              folder={UPLOAD_FOLDERS.PRODUCTS}
                              multiple
                              value={variant.images}
                              onChange={(images) => updateVariant(index, "images", images)}
                              helperText="Optional images specific to this variant (e.g. color or size)."
                            />
                          </div>
                        </div>
                      </div>
                    </VariantCard>
                  ))}
                </div>
              </FormSection>
            </div>

            <div className="hidden xl:block">
              <ProductPreviewPanel form={form} categoryLabel={categoryLabel} />
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-brand-amber/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} size="lg" className="gap-1.5 px-6">
              <Sparkles className="size-4" />
              {mutation.isPending ? "Saving..." : isEdit ? "Update product" : "Save product"}
            </Button>
          </div>
        </form>
      </div>

      <ProductFormGuideSidebar
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        isEdit={isEdit}
      />
    </DashboardLayout>
  );
}

export default function ProductForm() {
  return (
    <ProtectedRoute roles={["seller"]} requireApprovedSeller>
      <ProductFormPage />
    </ProtectedRoute>
  );
}
