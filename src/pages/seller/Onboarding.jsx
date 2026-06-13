import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { applyForSeller } from "@/services/sellerService.js";
import { ImageUpload } from "@/components/upload/ImageUpload.jsx";
import { SELLER_DOCUMENT_TYPES, UPLOAD_FOLDERS } from "@/lib/uploadConstants.js";
import { serializeSellerDocuments, serializeStoredImage } from "@/lib/storedImage.js";
import { useAuth } from "@/context/AuthContext.jsx";
import { toast } from "sonner";

const emptyDocuments = {
  idProof: null,
  businessProof: null,
  addressProof: null,
};

function OnboardingForm() {
  const navigate = useNavigate();
  const { refreshProfile, user } = useAuth();

  useEffect(() => {
    if (user?.seller) {
      navigate("/seller/profile", { replace: true });
    }
  }, [user, navigate]);

  const [form, setForm] = useState({
    name: "",
    mobileNumber: "",
    storeName: "",
    description: "",
    tinNumber: "",
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
    nationalId: "",
    documents: { ...emptyDocuments },
  });

  const mutation = useMutation({
    mutationFn: applyForSeller,
    onSuccess: async () => {
      toast.success("Application submitted successfully");
      await refreshProfile();
      navigate("/seller/profile");
    },
    onError: (err) => toast.error(err.message),
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const setDocument = (key) => (image) =>
    setForm((f) => ({
      ...f,
      documents: { ...f.documents, [key]: image },
    }));

  const validateDocuments = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateDocuments()) {
      return;
    }

    mutation.mutate({
      name: form.name,
      mobileNumber: form.mobileNumber,
      storeName: form.storeName,
      description: form.description,
      tinNumber: form.tinNumber,
      nationalId: form.nationalId,
      logo: serializeStoredImage(form.logo),
      banner: serializeStoredImage(form.banner),
      documents: serializeSellerDocuments(form.documents),
      address: {
        addressLine: form.addressLine,
        city: form.city,
        state: form.state,
        country: form.country,
        pincode: form.pincode,
      },
      bankDetails: {
        accountHolderName: form.accountHolderName,
        accountNumber: form.accountNumber,
        ifscCode: form.ifscCode,
      },
    });
  };

  return (
    <DashboardLayout title="Seller Application" variant="seller">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Apply to become a seller</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="font-medium text-sm">Your details</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Full name *</Label>
                <Input value={form.name} onChange={set("name")} required />
              </div>
              <div className="space-y-1">
                <Label>Mobile number *</Label>
                <Input
                  type="tel"
                  value={form.mobileNumber}
                  onChange={set("mobileNumber")}
                  placeholder="+91..."
                  required
                />
              </div>
            </div>

            <p className="font-medium text-sm">Store details</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1 md:col-span-2">
                <Label>Store name *</Label>
                <Input value={form.storeName} onChange={set("storeName")} required />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={set("description")} />
              </div>
              <div className="space-y-1">
                <Label>TIN number</Label>
                <Input value={form.tinNumber} onChange={set("tinNumber")} />
              </div>
              <ImageUpload
                label="Store logo"
                folder={UPLOAD_FOLDERS.STORE_LOGOS}
                value={form.logo}
                onChange={(logo) => setForm((f) => ({ ...f, logo }))}
              />
              <div className="md:col-span-2">
                <ImageUpload
                  label="Store banner"
                  folder={UPLOAD_FOLDERS.STORE_BANNERS}
                  value={form.banner}
                  onChange={(banner) => setForm((f) => ({ ...f, banner }))}
                />
              </div>
            </div>

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

            <p className="font-medium text-sm">Verification documents *</p>
            <p className="text-muted-foreground text-xs">
              Upload clear photos or scans (JPEG, PNG, WEBP). These are required for seller approval.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <ImageUpload
                label="Government ID proof *"
                folder={UPLOAD_FOLDERS.SELLER_DOCUMENTS}
                documentType={SELLER_DOCUMENT_TYPES.ID_PROOF}
                value={form.documents.idProof}
                onChange={setDocument("idProof")}
                helperText="National ID, passport, or driving licence."
              />
              <ImageUpload
                label="Business proof *"
                folder={UPLOAD_FOLDERS.SELLER_DOCUMENTS}
                documentType={SELLER_DOCUMENT_TYPES.BUSINESS_PROOF}
                value={form.documents.businessProof}
                onChange={setDocument("businessProof")}
                helperText="Business registration or trade licence."
              />
              <div className="md:col-span-2">
                <ImageUpload
                  label="Address proof *"
                  folder={UPLOAD_FOLDERS.SELLER_DOCUMENTS}
                  documentType={SELLER_DOCUMENT_TYPES.ADDRESS_PROOF}
                  value={form.documents.addressProof}
                  onChange={setDocument("addressProof")}
                  helperText="Utility bill or bank statement showing your address."
                />
              </div>
            </div>

            <p className="font-medium text-sm">Bank details</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Account holder *</Label>
                <Input value={form.accountHolderName} onChange={set("accountHolderName")} required />
              </div>
              <div className="space-y-1">
                <Label>Account number *</Label>
                <Input value={form.accountNumber} onChange={set("accountNumber")} required />
              </div>
              <div className="space-y-1">
                <Label>IFSC code *</Label>
                <Input value={form.ifscCode} onChange={set("ifscCode")} required />
              </div>
            </div>

            <p className="font-medium text-sm">National ID</p>
            <div className="space-y-1">
              <Label>National ID number *</Label>
              <Input value={form.nationalId} onChange={set("nationalId")} required />
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Submitting..." : "Submit application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default function Onboarding() {
  return (
    <ProtectedRoute roles={["seller"]}>
      <OnboardingForm />
    </ProtectedRoute>
  );
}
