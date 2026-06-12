import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, X } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Select } from "@/components/ui/table.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { createProduct, getMyProducts, updateProduct } from "@/services/productService.js";
import { getCategories } from "@/services/categoryService.js";
import { ImageUpload } from "@/components/upload/ImageUpload.jsx";
import { UPLOAD_FOLDERS } from "@/lib/uploadConstants.js";
import { normalizeStoredImages } from "@/lib/storedImage.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { toast } from "sonner";

const createVariant = (overrides = {}) => ({
  key: crypto.randomUUID(),
  sku: "",
  size: "",
  color: "",
  stock: 0,
  price: 0,
  mrp: 0,
  images: [],
  ...overrides,
});

const mapProductVariant = (variant) =>
  createVariant({
    sku: variant.sku || "",
    size: variant.size || "",
    color: variant.color || "",
    stock: variant.stock ?? 0,
    price: variant.price ?? 0,
    mrp: variant.mrp ?? 0,
    images: normalizeStoredImages(variant.images),
  });

/**
 * Payload sent to POST /api/products (create) or PUT /api/products/:id (update).
 *
 * @example
 * {
 *   "title": "Women's Black Puff Sleeve Casual Top",
 *   "description": "Soft cotton top with puff sleeves.",
 *   "category": "6a1f22789bb7ea2c8eac0ac2",
 *   "gender": "Women",
 *   "images": [
 *     { "url": "https://nilecart.s3.us-east-1.amazonaws.com/products/.../img1.png", "key": "products/sellerId/img1.png" }
 *   ],
 *   "tags": ["casual", "cotton"],
 *   "variants": [
 *     {
 *       "sku": "WBT-BLK-S",
 *       "size": "S",
 *       "color": "Black",
 *       "stock": 22,
 *       "price": 299,
 *       "mrp": 495,
 *       "images": [
 *         { "url": "https://nilecart.s3.us-east-1.amazonaws.com/products/.../variant.png", "key": "products/sellerId/variant.png" }
 *       ]
 *     }
 *   ]
 * }
 */
const buildProductPayload = (form) => ({
  title: form.title,
  description: form.description,
  category: form.category,
  gender: form.gender,
  images: form.images,
  tags: form.tags,
  variants: form.variants.map(({ key, ...variant }) => ({
    sku: variant.sku.trim(),
    size: variant.size.trim(),
    color: variant.color.trim(),
    stock: Number(variant.stock) || 0,
    price: Number(variant.price),
    mrp: Number(variant.mrp),
    images: variant.images || [],
  })),
});

function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: categoriesData } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => getCategories({ tree: "true" }),
  });

  const categoryOptions = useMemo(() => {
    const flatten = (nodes, parentName = "") =>
      (nodes || []).flatMap((node) => {
        const label = parentName ? `${parentName} › ${node.name}` : node.name;
        const children = flatten(node.children, node.name);

        if (children.length > 0) {
          return children;
        }

        return [{ _id: node._id, label }];
      });

    return flatten(categoriesData?.categories || []);
  }, [categoriesData]);

  const { data: productsData } = useQuery({
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

  return (
    <DashboardLayout title={isEdit ? "Edit product" : "New product"} variant="seller">
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>{isEdit ? "Edit product" : "Create product"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Title *</Label>
                <Input value={form.title} onChange={set("title")} required />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={set("description")} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Category *</Label>
                  <Select value={form.category} onChange={set("category")} required>
                    <option value="">Select category</option>
                    {categoryOptions.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Gender</Label>
                  <Select value={form.gender} onChange={set("gender")}>
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                  </Select>
                </div>
              </div>
              <ImageUpload
                label="Product images"
                folder={UPLOAD_FOLDERS.PRODUCTS}
                multiple
                value={form.images}
                onChange={(images) => setForm((f) => ({ ...f, images }))}
                helperText="Upload JPEG, PNG, or WEBP. Images are stored directly in S3."
              />
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="e.g. summer, cotton, casual"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addTag(tagInput)}
                    disabled={!tagInput.trim()}
                  >
                    Add
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs">
                  Press Enter or click Add. Tags help with search and filtering.
                </p>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.tags.map((tag, index) => (
                      <Badge key={`${tag}-${index}`} variant="secondary" className="gap-1 pr-1">
                        {tag}
                        <button
                          type="button"
                          className="rounded-sm p-0.5 hover:bg-muted"
                          onClick={() => removeTag(index)}
                          aria-label={`Remove ${tag}`}
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-sm">Variants</p>
                  <p className="text-muted-foreground text-xs">
                    Add one row per size, color, or SKU combination.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                  <Plus className="mr-1 size-4" />
                  Add variant
                </Button>
              </div>

              <div className="space-y-4">
                {form.variants.map((variant, index) => (
                  <div
                    key={variant.key}
                    className="rounded-lg border border-border bg-muted/20 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <p className="font-medium text-sm">Variant {index + 1}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeVariant(index)}
                        disabled={form.variants.length <= 1}
                      >
                        <Trash2 className="mr-1 size-4" />
                        Remove
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-1">
                        <Label>SKU *</Label>
                        <Input
                          value={variant.sku}
                          onChange={(e) => updateVariant(index, "sku", e.target.value)}
                          placeholder="e.g. TOP-001-M-RED"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Size</Label>
                        <Input
                          value={variant.size}
                          onChange={(e) => updateVariant(index, "size", e.target.value)}
                          placeholder="e.g. M"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Color</Label>
                        <Input
                          value={variant.color}
                          onChange={(e) => updateVariant(index, "color", e.target.value)}
                          placeholder="e.g. Red"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Stock</Label>
                        <Input
                          type="number"
                          min={0}
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, "stock", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Price *</Label>
                        <Input
                          type="number"
                          min={0}
                          value={variant.price}
                          onChange={(e) => updateVariant(index, "price", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>MRP *</Label>
                        <Input
                          type="number"
                          min={0}
                          value={variant.mrp}
                          onChange={(e) => updateVariant(index, "mrp", e.target.value)}
                          required
                        />
                      </div>
                      <div className="md:col-span-2 lg:col-span-3">
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
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save product"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
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
