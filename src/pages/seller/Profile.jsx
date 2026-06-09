import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { getMySellerProfile, updateMySellerProfile } from "@/services/sellerService.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { useAuth } from "@/context/AuthContext.jsx";
import { toast } from "sonner";

const statusVariant = {
  Pending: "warning",
  Approved: "success",
  Rejected: "destructive",
};

function ProfileForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refreshProfile, user } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.seller.profile,
    queryFn: getMySellerProfile,
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && isError && user?.role === "seller" && !user?.seller) {
      navigate("/seller/onboarding", { replace: true });
    }
  }, [isLoading, isError, user, navigate]);

  const seller = data?.seller;
  const isPending = seller?.approvalStatus === "Pending";
  const isRejected = seller?.approvalStatus === "Rejected";

  const [form, setForm] = useState({
    storeName: "",
    description: "",
    tinNumber: "",
    logo: "",
    banner: "",
  });

  useEffect(() => {
    if (seller) {
      setForm({
        storeName: seller.storeName || "",
        description: seller.description || "",
        tinNumber: seller.tinNumber || "",
        logo: seller.logo || "",
        banner: seller.banner || "",
      });
    }
  }, [seller]);

  const mutation = useMutation({
    mutationFn: updateMySellerProfile,
    onSuccess: async () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.seller.profile });
      await refreshProfile();
    },
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  if (isLoading) {
    return (
      <DashboardLayout title="Profile" variant="seller">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profile" variant="seller">
      <Card className="max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Store profile</CardTitle>
          {seller && (
            <Badge variant={statusVariant[seller.approvalStatus] || "secondary"}>
              {seller.approvalStatus}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isRejected && seller.rejectionReason && (
            <p className="rounded-lg bg-destructive/10 p-3 text-destructive text-sm">
              Rejected: {seller.rejectionReason}. Contact support to reapply.
            </p>
          )}
          {isPending && (
            <p className="rounded-lg bg-yellow-100 p-3 text-sm dark:bg-yellow-900/30">
              Your application is under review. You can update details until approved.
            </p>
          )}

          {!isRejected && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate(form);
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <Label>Store name</Label>
                <Input
                  value={form.storeName}
                  onChange={set("storeName")}
                  disabled={!isPending}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={set("description")} />
              </div>
              {isPending && (
                <div className="space-y-1">
                  <Label>TIN number</Label>
                  <Input value={form.tinNumber} onChange={set("tinNumber")} />
                </div>
              )}
              <div className="space-y-1">
                <Label>Logo URL</Label>
                <Input value={form.logo} onChange={set("logo")} />
              </div>
              <div className="space-y-1">
                <Label>Banner URL</Label>
                <Input value={form.banner} onChange={set("banner")} />
              </div>
              <Button type="submit" disabled={mutation.isPending}>
                Save changes
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default function Profile() {
  return (
    <ProtectedRoute roles={["seller"]}>
      <ProfileForm />
    </ProtectedRoute>
  );
}
