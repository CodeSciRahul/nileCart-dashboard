import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Button } from "@/components/ui/button.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { getMyProducts, deleteProduct } from "@/services/productService.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { toast } from "sonner";

function ProductsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.seller.products({}),
    queryFn: () => getMyProducts(),
  });

  const removeMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Product deactivated");
      queryClient.invalidateQueries({ queryKey: ["seller", "products"] });
    },
  });

  const products = data?.products || [];

  return (
    <DashboardLayout title="Products" variant="seller">
      <div className="mb-4 flex justify-end">
        <Link to="/seller/products/new">
          <Button>Add product</Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground text-sm">No products yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>{product.title}</TableCell>
                <TableCell>{product.category?.name || "—"}</TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? "success" : "secondary"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Link to={`/seller/products/${product._id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  {product.isActive && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeMutation.mutate(product._id)}
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

export default function Products() {
  return (
    <ProtectedRoute roles={["seller"]} requireApprovedSeller>
      <ProductsPage />
    </ProtectedRoute>
  );
}
