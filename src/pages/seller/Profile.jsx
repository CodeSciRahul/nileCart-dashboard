import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Landmark, MapPin, Sparkles, Store, Type } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import {
  BrandingPreview,
  FormSection,
  ProfileAlert,
  ProfileHero,
  ProfileSkeleton,
} from "@/components/seller/SellerProfileUI.jsx";
import { getMySellerProfile, updateMySellerProfile } from "@/services/sellerService.js";
import { ImageUpload } from "@/components/upload/ImageUpload.jsx";
import { SELLER_DOCUMENT_TYPES, UPLOAD_FOLDERS } from "@/constants/uploads.js";
import { EMPTY_SELLER_DOCUMENTS } from "@/constants/sellerDocuments.js";
import {
  getImageUrl,
  normalizeSellerDocuments,
  normalizeStoredImage,
  serializeSellerDocuments,
  serializeStoredImage,
} from "@/lib/storedImage.js";
import { queryKeys } from "@/lib/queryKeys.js";
import { useAuth } from "@/context/AuthContext.jsx";
import { toast } from "sonner";

const emptyDocuments = EMPTY_SELLER_DOCUMENTS;

function Field({ label, children, hint }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

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
        <ProfileSkeleton />
      </DashboardLayout>
    );
  }

  const logoUrl = getImageUrl(form.logo);

  return (
    <DashboardLayout title="Profile" variant="seller">
      <div className="mx-auto max-w-5xl space-y-6">
        <ProfileHero seller={seller} logoUrl={logoUrl} />

        <ProfileAlert
          isRejected={isRejected}
          isPending={isPending}
          rejectionReason={seller?.rejectionReason}
        />

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
            <div className="space-y-6">
              <div className="xl:hidden">
                <BrandingPreview
                  logo={form.logo}
                  banner={form.banner}
                  storeName={form.storeName}
                  description={form.description}
                />
              </div>

              <FormSection
                step={1}
                icon={Store}
                title="Store information"
                description="Your store name and description shown to customers."
              >
                <Field label="Store name">
                  <Input
                    value={form.storeName}
                    onChange={set("storeName")}
                    disabled={!canEditApplication}
                    required
                    placeholder="e.g. Kashyap Dresses"
                  />
                </Field>
                <Field label="Description">
                  <Textarea
                    value={form.description}
                    onChange={set("description")}
                    placeholder="Tell customers what makes your store unique..."
                    className="min-h-24"
                  />
                </Field>
                {canEditApplication && (
                  <Field label="TIN number" hint="Tax identification number for your business.">
                    <Input value={form.tinNumber} onChange={set("tinNumber")} />
                  </Field>
                )}
              </FormSection>

              <FormSection
                step={2}
                icon={Type}
                title="Branding"
                description="Upload a logo and banner to build your store identity."
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="rounded-xl border border-brand-amber/15 bg-brand-cream/20 p-4">
                    <ImageUpload
                      label="Store logo"
                      folder={UPLOAD_FOLDERS.STORE_LOGOS}
                      value={form.logo}
                      onChange={(logo) => setForm((f) => ({ ...f, logo }))}
                    />
                  </div>
                  <div className="rounded-xl border border-brand-amber/15 bg-brand-cream/20 p-4 sm:col-span-2">
                    <ImageUpload
                      label="Store banner"
                      folder={UPLOAD_FOLDERS.STORE_BANNERS}
                      value={form.banner}
                      onChange={(banner) => setForm((f) => ({ ...f, banner }))}
                    />
                  </div>
                </div>
              </FormSection>

              {isRejected && (
                <>
                  <FormSection
                    step={3}
                    icon={MapPin}
                    title="Address"
                    description="Your registered business address."
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <Field label="Address line">
                          <Input value={form.addressLine} onChange={set("addressLine")} />
                        </Field>
                      </div>
                      <Field label="City">
                        <Input value={form.city} onChange={set("city")} />
                      </Field>
                      <Field label="State">
                        <Input value={form.state} onChange={set("state")} />
                      </Field>
                      <Field label="Country">
                        <Input value={form.country} onChange={set("country")} />
                      </Field>
                      <Field label="Pincode">
                        <Input value={form.pincode} onChange={set("pincode")} />
                      </Field>
                    </div>
                  </FormSection>

                  <FormSection
                    step={4}
                    icon={FileText}
                    title="Verification documents"
                    description="Upload clear photos or scans (JPEG, PNG, WEBP). Required to resubmit."
                  >
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
                  </FormSection>

                  <FormSection
                    step={5}
                    icon={Landmark}
                    title="Bank details"
                    description="Account information for receiving payouts."
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Account holder *">
                        <Input
                          value={form.accountHolderName}
                          onChange={set("accountHolderName")}
                          required
                        />
                      </Field>
                      <Field label="Account number *">
                        <Input
                          value={form.accountNumber}
                          onChange={set("accountNumber")}
                          required
                        />
                      </Field>
                      <Field label="IFSC code *">
                        <Input value={form.ifscCode} onChange={set("ifscCode")} required />
                      </Field>
                      <Field label="National ID number *">
                        <Input value={form.nationalId} onChange={set("nationalId")} required />
                      </Field>
                    </div>
                  </FormSection>
                </>
              )}
            </div>

            <div className="hidden xl:block">
              <BrandingPreview
                logo={form.logo}
                banner={form.banner}
                storeName={form.storeName}
                description={form.description}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-brand-amber/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {isRejected
                ? "Resubmitting sends your application back for admin review."
                : "Changes to branding appear on your storefront after saving."}
            </p>
            <Button type="submit" disabled={mutation.isPending} size="lg" className="gap-1.5 px-6">
              <Sparkles className="size-4" />
              {mutation.isPending
                ? "Saving..."
                : isRejected
                  ? "Resubmit application"
                  : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
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
