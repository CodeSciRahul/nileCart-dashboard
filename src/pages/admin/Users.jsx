import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Button } from "@/components/ui/button.jsx";
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
import { listUsers, updateUserStatus } from "@/services/adminService.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { useState } from "react";
import { toast } from "sonner";

function UsersPage() {
  const queryClient = useQueryClient();
  const [role, setRole] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.users(role),
    queryFn: () => listUsers(role ? { role } : {}),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }) => updateUserStatus(id, { isActive }),
    onSuccess: () => {
      toast.success("User status updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const users = data?.users || [];

  return (
    <DashboardLayout title="Users" variant="admin">
      <div className="mb-4">
        <Select value={role} onChange={(e) => setRole(e.target.value)} className="w-48">
          <option value="">All roles</option>
          <option value="customer">Customer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name || "—"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? "success" : "destructive"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {user.role !== "admin" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        statusMutation.mutate({ id: user._id, isActive: !user.isActive })
                      }
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
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

export default function Users() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <UsersPage />
    </ProtectedRoute>
  );
}
