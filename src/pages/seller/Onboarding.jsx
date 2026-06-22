import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  FileText,
  Fingerprint,
  Landmark,
  MapPin,
  Sparkles,
  Store,
  User,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import {
  BrandingPreview,
  FormSection,
} from "@/components/seller/SellerProfileUI.jsx";
import {
  Field,
  OnboardingHero,
  OnboardingProgress,
  OnboardingWelcomeBanner,
} from "@/components/seller/OnboardingUI.jsx";
import {
  ONBOARDING_PROGRESS_STEPS,
  onboardingStepId,
  scrollToOnboardingStep,
} from "@/constants/sellerOnboarding.js";
import { EMPTY_SELLER_DOCUMENTS } from "@/constants/sellerDocuments.js";
import { SELLER_DOCUMENT_TYPES, UPLOAD_FOLDERS } from "@/constants/uploads.js";
import { OnboardingGuideSidebar } from "@/components/seller/OnboardingGuideSidebar.jsx";
import { ImageUpload } from "@/components/upload/ImageUpload.jsx";
import { applyForSeller } from "@/services/sellerService.js";
import { serializeSellerDocuments, serializeStoredImage } from "@/lib/storedImage.js";
import { useAuth } from "@/context/AuthContext.jsx";
import { toast } from "sonner";

const emptyDocuments = EMPTY_SELLER_DOCUMENTS;

function OnboardingForm() {
  const navigate = useNavigate();
  const { refreshProfile, user } = useAuth();
  const [guideOpen, setGuideOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const handleStepClick = (step) => {
    scrollToOnboardingStep(step);
    setActiveStep(step);
  };

  useEffect(() => {
    const sections = ONBOARDING_PROGRESS_STEPS.map((_, i) =>
      document.getElementById(onboardingStepId(i + 1))
    ).filter(Boolean);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible?.target.id) return;

        const step = Number(visible.target.id.replace("onboarding-step-", ""));
        if (!Number.isNaN(step)) setActiveStep(step);
      },
      { rootMargin: "-15% 0px -55% 0px", threshold: [0, 0.2, 0.4, 0.6] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

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
      <div className="mx-auto max-w-5xl space-y-6">
        <OnboardingHero onOpenGuide={() => setGuideOpen(true)} />
        <OnboardingProgress activeStep={activeStep} onStepClick={handleStepClick} />
        <OnboardingWelcomeBanner />

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
                id={onboardingStepId(1)}
                step={1}
                icon={User}
                title="Your details"
                description="Personal contact information for your seller account."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Full name" required>
                    <Input value={form.name} onChange={set("name")} required />
                  </Field>
                  <Field label="Mobile number" required>
                    <Input
                      type="tel"
                      value={form.mobileNumber}
                      onChange={set("mobileNumber")}
                      placeholder="+91..."
                      required
                    />
                  </Field>
                </div>
              </FormSection>

              <FormSection
                id={onboardingStepId(2)}
                step={2}
                icon={Store}
                title="Store details"
                description="How your shop appears on the marketplace."
              >
                <Field label="Store name" required>
                  <Input value={form.storeName} onChange={set("storeName")} required />
                </Field>
                <Field label="Description">
                  <Textarea
                    value={form.description}
                    onChange={set("description")}
                    placeholder="Tell customers about your store..."
                    className="min-h-24"
                  />
                </Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="TIN number" hint="Tax identification number (optional).">
                    <Input value={form.tinNumber} onChange={set("tinNumber")} />
                  </Field>
                  <div className="rounded-xl border border-brand-amber/15 bg-brand-cream/20 p-4">
                    <ImageUpload
                      label="Store logo"
                      folder={UPLOAD_FOLDERS.STORE_LOGOS}
                      value={form.logo}
                      onChange={(logo) => setForm((f) => ({ ...f, logo }))}
                    />
                  </div>
                  <div className="md:col-span-2 rounded-xl border border-brand-amber/15 bg-brand-cream/20 p-4">
                    <ImageUpload
                      label="Store banner"
                      folder={UPLOAD_FOLDERS.STORE_BANNERS}
                      value={form.banner}
                      onChange={(banner) => setForm((f) => ({ ...f, banner }))}
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection
                id={onboardingStepId(3)}
                step={3}
                icon={MapPin}
                title="Address"
                description="Your registered business or operating address."
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
                id={onboardingStepId(4)}
                step={4}
                icon={FileText}
                title="Verification documents"
                description="Upload clear photos or scans (JPEG, PNG, WEBP). Required for seller approval."
              >
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
              </FormSection>

              <FormSection
                id={onboardingStepId(5)}
                step={5}
                icon={Landmark}
                title="Bank details"
                description="Account information for receiving payouts."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Account holder" required>
                    <Input
                      value={form.accountHolderName}
                      onChange={set("accountHolderName")}
                      required
                    />
                  </Field>
                  <Field label="Account number" required>
                    <Input
                      value={form.accountNumber}
                      onChange={set("accountNumber")}
                      required
                    />
                  </Field>
                  <Field label="IFSC code" required>
                    <Input value={form.ifscCode} onChange={set("ifscCode")} required />
                  </Field>
                </div>
              </FormSection>

              <FormSection
                step={6}
                icon={Fingerprint}
                title="National ID"
                description="Must match your government ID proof document."
              >
                <Field label="National ID number" required>
                  <Input value={form.nationalId} onChange={set("nationalId")} required />
                </Field>
              </FormSection>
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

          <div
            id={onboardingStepId(6)}
            className="scroll-mt-24 mt-8 flex flex-col-reverse gap-3 border-t border-brand-amber/10 pt-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-xs text-muted-foreground">
              By submitting, you agree that your information is accurate and ready for review.
            </p>
            <Button type="submit" disabled={mutation.isPending} size="lg" className="gap-1.5 px-6">
              <Sparkles className="size-4" />
              {mutation.isPending ? "Submitting..." : "Submit application"}
            </Button>
          </div>
        </form>
      </div>

      <OnboardingGuideSidebar open={guideOpen} onClose={() => setGuideOpen(false)} />
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
