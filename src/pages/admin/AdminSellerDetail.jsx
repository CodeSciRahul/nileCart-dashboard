import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import {
  SellerDetailGrid,
  SellerDetailHero,
  SellerDetailSkeleton,
  SellerNotFound,
} from "@/components/admin/SellerDetailUI.jsx";
import {
  getSellerById,
  approveSeller,
  rejectSeller,
  deactivateSeller,
} from "@/services/adminService.js";
import { normalizeSellerDocuments } from "@/lib/storedImage.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { toast } from "sonner";
import { CheckCircle2, PowerOff, XCircle } from "lucide-react";

function AdminSellerDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [commissionRate, setCommissionRate] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.admin.seller(id),
    queryFn: () => getSellerById(id),
  });

  const seller = data?.seller;
  const documents = normalizeSellerDocuments(seller?.documents);

  const invalidateSellerQueries = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.seller(id) });
    queryClient.invalidateQueries({ queryKey: ["admin", "sellers"] });
  };

  const approveMutation = useMutation({
    mutationFn: (payload) => approveSeller(id, payload),
    onSuccess: () => {
      toast.success("Seller approved");
      setShowApprove(false);
      setCommissionRate("");
      invalidateSellerQueries();
    },
    onError: (err) => toast.error(err.message),
  });

  const rejectMutation = useMutation({
    mutationFn: (payload) => rejectSeller(id, payload),
    onSuccess: () => {
      toast.success("Seller rejected");
      setShowReject(false);
      setRejectReason("");
      invalidateSellerQueries();
    },
    onError: (err) => toast.error(err.message),
  });

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateSeller(id),
    onSuccess: () => {
      toast.success("Seller deactivated");
      invalidateSellerQueries();
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Seller details" variant="admin">
        <SellerDetailSkeleton />
      </DashboardLayout>
    );
  }

  if (isError || !seller) {
    return (
      <DashboardLayout title="Seller details" variant="admin">
        <SellerNotFound />
      </DashboardLayout>
    );
  }

  const isApproved = seller.approvalStatus === "Approved";
  const canModerate = !isApproved;

  const handleApprove = () => {
    approveMutation.mutate({
      commissionRate: commissionRate ? Number(commissionRate) : undefined,
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    rejectMutation.mutate({ reason: rejectReason.trim() });
  };

  const handleDeactivate = () => {
    if (window.confirm("Deactivate this seller? Their store will no longer be active.")) {
      deactivateMutation.mutate();
    }
  };

  return (
    <DashboardLayout title={seller.storeName} variant="admin">
      <div className="space-y-6">
        <SellerDetailHero seller={seller} isApproved={isApproved} />

        {seller.rejectionReason && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 animate-in fade-in slide-in-from-top-2 duration-400">
            <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-destructive">Rejection reason</p>
              <p className="mt-1 text-sm text-destructive/90">{seller.rejectionReason}</p>
            </div>
          </div>
        )}

        <SellerDetailGrid seller={seller} documents={documents} />

        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500 [animation-delay:400ms] [animation-fill-mode:both]">
          {canModerate && (
            <div className="flex flex-wrap gap-2">
              {!showApprove && !showReject && (
                <>
                  <Button onClick={() => setShowApprove(true)} className="gap-1.5">
                    <CheckCircle2 className="size-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowReject(true)}
                    className="gap-1.5"
                  >
                    <XCircle className="size-4" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          )}

          {showApprove && (
            <Card className="max-w-md overflow-hidden border-brand-amber/25 p-0 shadow-md animate-in fade-in zoom-in-95 duration-300">
              <CardHeader className="border-b border-brand-amber/10 bg-gradient-to-r from-brand-cream/50 to-brand-white">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="size-4 text-brand-amber" />
                  Approve seller
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-5">
                <div className="space-y-1">
                  <Label htmlFor="commissionRate">Commission % (optional)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    min="0"
                    max="100"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleApprove} disabled={approveMutation.isPending}>
                    Confirm approval
                  </Button>
                  <Button variant="outline" onClick={() => setShowApprove(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {showReject && (
            <Card className="max-w-md overflow-hidden border-destructive/20 p-0 shadow-md animate-in fade-in zoom-in-95 duration-300">
              <CardHeader className="border-b border-destructive/10 bg-destructive/5">
                <CardTitle className="flex items-center gap-2 text-base text-destructive">
                  <XCircle className="size-4" />
                  Reject seller
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-5">
                <div className="space-y-1">
                  <Label htmlFor="rejectReason">Rejection reason</Label>
                  <Textarea
                    id="rejectReason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Explain why this application is rejected"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={rejectMutation.isPending}
                  >
                    Confirm rejection
                  </Button>
                  <Button variant="outline" onClick={() => setShowReject(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isApproved && seller.isActive && (
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={deactivateMutation.isPending}
              className="gap-1.5"
            >
              <PowerOff className="size-4" />
              Deactivate seller
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function AdminSellerDetail() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <AdminSellerDetailPage />
    </ProtectedRoute>
  );
}
