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
  listAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from "@/services/adminService.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { toast } from "sonner";

function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", image: "", description: "" });
  const [editId, setEditId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: listAdminCategories,
  });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editId ? updateAdminCategory(editId, payload) : createAdminCategory(payload),
    onSuccess: () => {
      toast.success(editId ? "Category updated" : "Category created");
      setForm({ name: "", image: "", description: "" });
      setEditId(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminCategory,
    onSuccess: () => {
      toast.success("Category deactivated");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
    },
  });

  const categories = data?.categories || [];

  return (
    <DashboardLayout title="Categories" variant="admin">
      <Card className="mb-6 max-w-xl">
        <CardHeader>
          <CardTitle>{editId ? "Edit category" : "Create category"}</CardTitle>
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
                    size="sm"
                    variant="outline"
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
                      size="sm"
                      variant="destructive"
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

export default function AdminCategories() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <AdminCategoriesPage />
    </ProtectedRoute>
  );
}
