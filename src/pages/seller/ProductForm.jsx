import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Select } from "@/components/ui/table.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { createProduct, getMyProducts, updateProduct } from "@/services/productService.js";
import { getCategories } from "@/services/categoryService.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { toast } from "sonner";

const defaultVariant = {
  sku: "",
  size: "",
  color: "",
  stock: 0,
  price: 0,
  mrp: 0,
};

function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: categoriesData } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
  });

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
    images: "",
    variant: { ...defaultVariant },
  });

  useEffect(() => {
    if (isEdit && productsData?.products) {
      const product = productsData.products.find((p) => p._id === id);
      if (product) {
        const v = product.variants?.[0] || defaultVariant;
        setForm({
          title: product.title,
          description: product.description || "",
          category: product.category?._id || product.category || "",
          gender: product.gender || "Women",
          images: (product.images || []).join(", "),
          variant: {
            sku: v.sku || "",
            size: v.size || "",
            color: v.color || "",
            stock: v.stock || 0,
            price: v.price || 0,
            mrp: v.mrp || 0,
          },
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
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setVariant = (key) => (e) =>
    setForm((f) => ({
      ...f,
      variant: {
        ...f.variant,
        [key]: ["stock", "price", "mrp"].includes(key)
          ? Number(e.target.value)
          : e.target.value,
      },
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      title: form.title,
      description: form.description,
      category: form.category,
      gender: form.gender,
      images: form.images
        ? form.images.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      variants: [form.variant],
    });
  };

  return (
    <DashboardLayout title={isEdit ? "Edit product" : "New product"} variant="seller">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{isEdit ? "Edit product" : "Create product"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input value={form.title} onChange={set("title")} required />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={set("description")} />
            </div>
            <div className="space-y-1">
              <Label>Category *</Label>
              <Select value={form.category} onChange={set("category")} required>
                <option value="">Select category</option>
                {(categoriesData?.categories || []).map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
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
            <div className="space-y-1">
              <Label>Image URLs (comma separated)</Label>
              <Input value={form.images} onChange={set("images")} />
            </div>

            <p className="font-medium text-sm">Variant</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>SKU *</Label>
                <Input value={form.variant.sku} onChange={setVariant("sku")} required />
              </div>
              <div className="space-y-1">
                <Label>Size</Label>
                <Input value={form.variant.size} onChange={setVariant("size")} />
              </div>
              <div className="space-y-1">
                <Label>Color</Label>
                <Input value={form.variant.color} onChange={setVariant("color")} />
              </div>
              <div className="space-y-1">
                <Label>Stock</Label>
                <Input type="number" value={form.variant.stock} onChange={setVariant("stock")} />
              </div>
              <div className="space-y-1">
                <Label>Price *</Label>
                <Input type="number" value={form.variant.price} onChange={setVariant("price")} required />
              </div>
              <div className="space-y-1">
                <Label>MRP *</Label>
                <Input type="number" value={form.variant.mrp} onChange={setVariant("mrp")} required />
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
