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
import { ImageUpload } from "@/components/upload/ImageUpload.jsx";
import { SELLER_DOCUMENT_TYPES, UPLOAD_FOLDERS } from "@/lib/uploadConstants.js";
import {
  normalizeSellerDocuments,
  normalizeStoredImage,
  serializeSellerDocuments,
  serializeStoredImage,
} from "@/lib/storedImage.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { useAuth } from "@/context/AuthContext.jsx";
import { toast } from "sonner";

const statusVariant = {
  Pending: "warning",
  Approved: "success",
  Rejected: "destructive",
};

const emptyDocuments = {
  idProof: null,
  businessProof: null,
  addressProof: null,
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
  const canEditApplication = isPending || isRejected;

  const [form, setForm] = useState({
    storeName: "",
    description: "",
    tinNumber: "",
    nationalId: "",
    logo: null,
    banner: null,
    addressLine: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    documents: { ...emptyDocuments },
  });

  useEffect(() => {
    if (seller) {
      const documents = normalizeSellerDocuments(seller.documents);
      setForm({
        storeName: seller.storeName || "",
        description: seller.description || "",
        tinNumber: seller.tinNumber || "",
        nationalId: seller.nationalId || "",
        logo: normalizeStoredImage(seller.logo),
        banner: normalizeStoredImage(seller.banner),
        addressLine: seller.address?.addressLine || "",
        city: seller.address?.city || "",
        state: seller.address?.state || "",
        country: seller.address?.country || "",
        pincode: seller.address?.pincode || "",
        accountHolderName: seller.bankDetails?.accountHolderName || "",
        accountNumber: seller.bankDetails?.accountNumber || "",
        ifscCode: seller.bankDetails?.ifscCode || "",
        documents,
      });
    }
  }, [seller]);

  const mutation = useMutation({
    mutationFn: updateMySellerProfile,
    onSuccess: async () => {
      toast.success(isRejected ? "Application resubmitted for review" : "Profile updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.seller.profile });
      await refreshProfile();
    },
    onError: (err) => toast.error(err.message),
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const setDocument = (key) => (image) =>
    setForm((f) => ({
      ...f,
      documents: { ...f.documents, [key]: image },
    }));

  const validateRejectedDocuments = () => {
    const { idProof, businessProof, addressProof } = form.documents;

    if (!idProof) {
      toast.error("Government ID proof is required.");
      return false;
    }
    if (!businessProof) {
      toast.error("Business proof is required.");
      return false;
    }
    if (!addressProof) {
      toast.error("Address proof is required.");
      return false;
    }

    return true;
  };

  const buildProfilePayload = () => {
    const payload = {
      storeName: form.storeName,
      description: form.description,
      tinNumber: form.tinNumber,
      logo: serializeStoredImage(form.logo),
      banner: serializeStoredImage(form.banner),
    };

    if (isRejected) {
      payload.nationalId = form.nationalId;
      payload.documents = serializeSellerDocuments(form.documents);
      payload.address = {
        addressLine: form.addressLine,
        city: form.city,
        state: form.state,
        country: form.country,
        pincode: form.pincode,
      };
      payload.bankDetails = {
        accountHolderName: form.accountHolderName,
        accountNumber: form.accountNumber,
        ifscCode: form.ifscCode,
      };
    }

    return payload;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isRejected && !validateRejectedDocuments()) {
      return;
    }

    mutation.mutate(buildProfilePayload());
  };

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
              Rejected: {seller.rejectionReason}. Update your details below and resubmit for
              review.
            </p>
          )}
          {isPending && (
            <p className="rounded-lg bg-yellow-100 p-3 text-sm dark:bg-yellow-900/30">
              Your application is under review. You can update details until approved.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Store name</Label>
              <Input
                value={form.storeName}
                onChange={set("storeName")}
                disabled={!canEditApplication}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={set("description")} />
            </div>
            {canEditApplication && (
              <div className="space-y-1">
                <Label>TIN number</Label>
                <Input value={form.tinNumber} onChange={set("tinNumber")} />
              </div>
            )}
            <ImageUpload
              label="Store logo"
              folder={UPLOAD_FOLDERS.STORE_LOGOS}
              value={form.logo}
              onChange={(logo) => setForm((f) => ({ ...f, logo }))}
            />
            <ImageUpload
              label="Store banner"
              folder={UPLOAD_FOLDERS.STORE_BANNERS}
              value={form.banner}
              onChange={(banner) => setForm((f) => ({ ...f, banner }))}
            />

            {isRejected && (
              <>
                <p className="font-medium text-sm">Address</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1 md:col-span-2">
                    <Label>Address line</Label>
                    <Input value={form.addressLine} onChange={set("addressLine")} />
                  </div>
                  <div className="space-y-1">
                    <Label>City</Label>
                    <Input value={form.city} onChange={set("city")} />
                  </div>
                  <div className="space-y-1">
                    <Label>State</Label>
                    <Input value={form.state} onChange={set("state")} />
                  </div>
                  <div className="space-y-1">
                    <Label>Country</Label>
                    <Input value={form.country} onChange={set("country")} />
                  </div>
                  <div className="space-y-1">
                    <Label>Pincode</Label>
                    <Input value={form.pincode} onChange={set("pincode")} />
                  </div>
                </div>

                <p className="font-medium text-sm">Verification documents</p>
                <p className="text-muted-foreground text-xs">
                  Upload clear photos or scans (JPEG, PNG, WEBP). Required to resubmit your
                  application.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <ImageUpload
                    label="Government ID proof *"
                    folder={UPLOAD_FOLDERS.SELLER_DOCUMENTS}
                    documentType={SELLER_DOCUMENT_TYPES.ID_PROOF}
                    value={form.documents.idProof}
                    onChange={setDocument("idProof")}
                  />
                  <ImageUpload
                    label="Business proof *"
                    folder={UPLOAD_FOLDERS.SELLER_DOCUMENTS}
                    documentType={SELLER_DOCUMENT_TYPES.BUSINESS_PROOF}
                    value={form.documents.businessProof}
                    onChange={setDocument("businessProof")}
                  />
                  <div className="md:col-span-2">
                    <ImageUpload
                      label="Address proof *"
                      folder={UPLOAD_FOLDERS.SELLER_DOCUMENTS}
                      documentType={SELLER_DOCUMENT_TYPES.ADDRESS_PROOF}
                      value={form.documents.addressProof}
                      onChange={setDocument("addressProof")}
                    />
                  </div>
                </div>

                <p className="font-medium text-sm">Bank details</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Account holder *</Label>
                    <Input
                      value={form.accountHolderName}
                      onChange={set("accountHolderName")}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Account number *</Label>
                    <Input
                      value={form.accountNumber}
                      onChange={set("accountNumber")}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>IFSC code *</Label>
                    <Input value={form.ifscCode} onChange={set("ifscCode")} required />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>National ID number *</Label>
                  <Input value={form.nationalId} onChange={set("nationalId")} required />
                </div>
              </>
            )}

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? "Saving..."
                : isRejected
                  ? "Resubmit application"
                  : "Save changes"}
            </Button>
          </form>
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
