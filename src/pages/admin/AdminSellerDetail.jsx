import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import {
  getSellerById,
  approveSeller,
  rejectSeller,
  deactivateSeller,
} from "@/services/adminService.js";
import { getImageUrl, normalizeSellerDocuments } from "@/lib/storedImage.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { toast } from "sonner";

const statusVariant = {
  Pending: "warning",
  Approved: "success",
  Rejected: "destructive",
};

const DOCUMENT_LABELS = {
  idProof: "Government ID proof",
  businessProof: "Business proof",
  addressProof: "Address proof",
};

function InfoRow({ label, value }) {
  if (!value) return null;

  return (
    <div className="grid gap-1 sm:grid-cols-3">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="sm:col-span-2 text-sm">{value}</dd>
    </div>
  );
}

function DocumentLink({ label, image }) {
  const url = getImageUrl(image);
  if (!url) return null;

  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-sm">{label}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary text-sm underline"
      >
        View document
      </a>
    </div>
  );
}

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
        <p className="text-muted-foreground text-sm">Loading...</p>
      </DashboardLayout>
    );
  }

  if (isError || !seller) {
    return (
      <DashboardLayout title="Seller details" variant="admin">
        <p className="text-muted-foreground text-sm">Seller not found.</p>
        <Link to="/admin/sellers">
          <Button variant="outline" size="sm" className="mt-4">
            Back to sellers
          </Button>
        </Link>
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
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link to="/admin/sellers">
          <Button variant="outline" size="sm">
            Back to sellers
          </Button>
        </Link>
        <Badge variant={statusVariant[seller.approvalStatus] || "secondary"}>
          {seller.approvalStatus}
        </Badge>
        {isApproved && (
          <Badge variant={seller.isActive ? "success" : "destructive"}>
            {seller.isActive ? "Active" : "Inactive"}
          </Badge>
        )}
      </div>

      {seller.rejectionReason && (
        <p className="mb-4 rounded-lg bg-destructive/10 p-3 text-destructive text-sm">
          Rejection reason: {seller.rejectionReason}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Store</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Store name" value={seller.storeName} />
            <InfoRow label="Store slug" value={seller.storeSlug} />
            <InfoRow label="Description" value={seller.description} />
            <InfoRow label="TIN number" value={seller.tinNumber} />
            <InfoRow label="National ID" value={seller.nationalId} />
            <InfoRow
              label="Commission rate"
              value={
                seller.commissionRate != null ? `${seller.commissionRate}%` : undefined
              }
            />
            <InfoRow
              label="Applied on"
              value={seller.createdAt ? new Date(seller.createdAt).toLocaleString() : undefined}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Owner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Name" value={seller.user?.name} />
            <InfoRow label="Email" value={seller.user?.email} />
            <InfoRow label="Mobile" value={seller.user?.mobileNumber} />
            <InfoRow label="Role" value={seller.user?.role} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Address line" value={seller.address?.addressLine} />
            <InfoRow label="City" value={seller.address?.city} />
            <InfoRow label="State" value={seller.address?.state} />
            <InfoRow label="Country" value={seller.address?.country} />
            <InfoRow label="Pincode" value={seller.address?.pincode} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              label="Account holder"
              value={seller.bankDetails?.accountHolderName}
            />
            <InfoRow label="Account number" value={seller.bankDetails?.accountNumber} />
            <InfoRow label="IFSC code" value={seller.bankDetails?.ifscCode} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-6">
            {getImageUrl(seller.logo) && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Logo</p>
                <img
                  src={getImageUrl(seller.logo)}
                  alt="Store logo"
                  className="h-24 w-24 rounded-lg border object-cover"
                />
              </div>
            )}
            {getImageUrl(seller.banner) && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Banner</p>
                <img
                  src={getImageUrl(seller.banner)}
                  alt="Store banner"
                  className="h-24 max-w-md rounded-lg border object-cover"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Verification documents</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            {Object.entries(DOCUMENT_LABELS).map(([key, label]) => (
              <DocumentLink key={key} label={label} image={documents[key]} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 space-y-4">
        {canModerate && (
          <div className="flex flex-wrap gap-2">
            {!showApprove && !showReject && (
              <>
                <Button onClick={() => setShowApprove(true)}>Approve</Button>
                <Button variant="destructive" onClick={() => setShowReject(true)}>
                  Reject
                </Button>
              </>
            )}
          </div>
        )}

        {showApprove && (
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-base">Approve seller</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-base">Reject seller</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
          >
            Deactivate seller
          </Button>
        )}
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
