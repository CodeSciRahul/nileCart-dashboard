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
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/categoryService.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { toast } from "sonner";

function CategoriesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", image: "", description: "" });
  const [editId, setEditId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
  });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editId ? updateCategory(editId, payload) : createCategory(payload),
    onSuccess: () => {
      toast.success(editId ? "Category updated" : "Category created");
      setForm({ name: "", image: "", description: "" });
      setEditId(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Category deactivated");
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });

  const categories = data?.categories || [];

  return (
    <DashboardLayout title="Categories" variant="seller">
      <Card className="mb-6 max-w-xl">
        <CardHeader>
          <CardTitle>{editId ? "Edit category" : "Add category"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate(form);
            }}
            className="space-y-3"
          >
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Image URL</Label>
              <Input
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saveMutation.isPending}>
                {editId ? "Update" : "Create"}
              </Button>
              {editId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditId(null);
                    setForm({ name: "", image: "", description: "" });
                  }}
                >
                  Cancel edit
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
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat._id}>
                <TableCell>{cat.name}</TableCell>
                <TableCell>{cat.slug}</TableCell>
                <TableCell>
                  <Badge variant={cat.isActive ? "success" : "secondary"}>
                    {cat.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditId(cat._id);
                      setForm({
                        name: cat.name,
                        image: cat.image || "",
                        description: cat.description || "",
                      });
                    }}
                  >
                    Edit
                  </Button>
                  {cat.isActive && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(cat._id)}
                    >
                      Deactivate
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

export default function Categories() {
  return (
    <ProtectedRoute roles={["seller"]} requireApprovedSeller>
      <CategoriesPage />
    </ProtectedRoute>
  );
}
