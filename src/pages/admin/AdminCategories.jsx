import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Select } from "@/components/ui/table.jsx";
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
  listAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from "@/services/adminService.js";
import { ImageUpload } from "@/components/upload/ImageUpload.jsx";
import { UPLOAD_FOLDERS } from "@/lib/uploadConstants.js";
import { normalizeStoredImage, serializeStoredImage } from "@/lib/storedImage.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { DEPARTMENT_OPTIONS, departmentLabel, formatParentDepartmentOption } from "@/lib/departments.js";
import { toast } from "sonner";

const emptyForm = {
  name: "",
  image: null,
  description: "",
  parent: "",
  department: "",
  displayOrder: 0,
  showInNav: true,
};

const flattenTree = (nodes, depth = 0) =>
  (nodes || []).flatMap((node) => [
    { ...node, depth },
    ...flattenTree(node.children, depth + 1),
  ]);

function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: () => listAdminCategories({ tree: "true" }),
  });

  const invalidateCategories = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
  };

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editId ? updateAdminCategory(editId, payload) : createAdminCategory(payload),
    onSuccess: () => {
      toast.success(editId ? "Category updated" : "Category created");
      setForm(emptyForm);
      setEditId(null);
      invalidateCategories();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminCategory,
    onSuccess: () => {
      toast.success("Category deactivated");
      invalidateCategories();
    },
    onError: (err) => toast.error(err.message),
  });

  const activateMutation = useMutation({
    mutationFn: (id) => updateAdminCategory(id, { isActive: true }),
    onSuccess: () => {
      toast.success("Category activated");
      invalidateCategories();
    },
    onError: (err) => toast.error(err.message),
  });

  const categoryTree = data?.categories || [];
  const flatCategories = useMemo(() => flattenTree(categoryTree), [categoryTree]);

  const parentOptions = useMemo(
    () => flatCategories.filter((cat) => !cat.parent && cat._id !== editId),
    [flatCategories, editId]
  );

  const resetForm = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  const openCreateSubcategory = (parentId) => {
    setEditId(null);
    setForm({ ...emptyForm, parent: parentId });
  };

  const openEdit = (cat) => {
    setEditId(cat._id);
    setForm({
      name: cat.name,
      image: normalizeStoredImage(cat.image),
      description: cat.description || "",
      parent: cat.parent?._id || cat.parent || "",
      department: cat.department || "",
      displayOrder: cat.displayOrder ?? 0,
      showInNav: cat.showInNav ?? true,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      image: serializeStoredImage(form.image),
      description: form.description || undefined,
      parent: form.parent || null,
      displayOrder: Number(form.displayOrder) || 0,
      showInNav: form.showInNav,
    };
    if (!form.parent) {
      payload.department = form.department;
    }
    saveMutation.mutate(payload);
  };

  return (
    <DashboardLayout title="Categories" variant="admin">
      <p className="text-muted-foreground mb-6 max-w-2xl text-sm">
        Build a two-level catalog: top-level departments (Men, Women, Kids, Sports, etc.) and
        subcategories under them (e.g. T-Shirts, Dresses). Sellers assign products to
        subcategories from this catalog.
      </p>

      <Card className="mb-6 max-w-xl">
        <CardHeader>
          <CardTitle>
            {editId
              ? "Edit category"
              : form.parent
                ? "Create subcategory"
                : "Create department"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label>Parent department</Label>
              <Select
                value={form.parent}
                onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))}
                disabled={Boolean(
                  editId && flatCategories.find((c) => c._id === editId)?.children?.length
                )}
              >
                <option value="">None — create a new top-level department</option>
                {parentOptions.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {formatParentDepartmentOption(cat)}
                  </option>
                ))}
              </Select>
              <p className="text-muted-foreground text-xs">
                Leave empty to create a new department for the storefront header. Select a parent
                department to add a subcategory under it.
              </p>
            </div>
            {!form.parent && (
              <div className="space-y-1">
                <Label>Department</Label>
                <Select
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  required
                >
                  <option value="">Select department type</option>
                  {DEPARTMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} — {opt.description}
                    </option>
                  ))}
                </Select>
                <p className="text-muted-foreground text-xs">
                  Department type shown in storefront navigation.
                </p>
              </div>
            )}
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <ImageUpload
              label="Category image"
              folder={UPLOAD_FOLDERS.CATEGORIES}
              value={form.image}
              onChange={(image) => setForm((f) => ({ ...f, image }))}
            />
            <div className="space-y-1">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Display order</Label>
              <Input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.showInNav}
                onChange={(e) => setForm((f) => ({ ...f, showInNav: e.target.checked }))}
              />
              Show in navigation
            </label>
            <div className="flex gap-2">
              <Button type="submit" disabled={saveMutation.isPending}>
                {editId ? "Update" : "Create"}
              </Button>
              {(editId || form.parent) && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Nav</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flatCategories.map((cat) => (
              <TableRow key={cat._id}>
                <TableCell>
                  <span style={{ paddingLeft: `${cat.depth * 20}px` }} className="inline-flex items-center gap-2">
                    {cat.depth > 0 && (
                      <span className="text-muted-foreground text-xs">└</span>
                    )}
                    <span className={cat.depth === 0 ? "font-medium" : ""}>{cat.name}</span>
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={cat.depth === 0 ? "default" : "secondary"}>
                    {cat.depth === 0 ? "Department" : "Subcategory"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {cat.department ? departmentLabel(cat.department) : "—"}
                </TableCell>
                <TableCell>{cat.slug}</TableCell>
                <TableCell>{cat.displayOrder ?? 0}</TableCell>
                <TableCell>
                  <Badge variant={cat.showInNav ? "default" : "secondary"}>
                    {cat.showInNav ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={cat.isActive ? "success" : "secondary"}>
                    {cat.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  {/* {cat.depth === 0 && cat.isActive && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openCreateSubcategory(cat._id)}
                    >
                      Add sub
                    </Button>
                  )} */}
                  <Button size="sm" variant="outline" onClick={() => openEdit(cat)}>
                    Edit
                  </Button>
                  {cat.isActive ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(cat._id)}
                    >
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={activateMutation.isPending}
                      onClick={() => activateMutation.mutate(cat._id)}
                    >
                      Activate
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DashboardLayout>
  );
}

export default function AdminCategories() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <AdminCategoriesPage />
    </ProtectedRoute>
  );
}
