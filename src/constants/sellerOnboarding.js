import {
  FileText,
  Landmark,
  MapPin,
  Store,
  User,
} from "lucide-react";

export const ONBOARDING_PROGRESS_STEPS = [
  "Your details",
  "Store",
  "Address",
  "Documents",
  "Bank",
  "Submit",
];

export const onboardingStepId = (step) => `onboarding-step-${step}`;

export function scrollToOnboardingStep(step) {
  document.getElementById(onboardingStepId(step))?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export const ONBOARDING_GUIDE_STEPS = [
  {
    icon: User,
    title: "Your details",
    summary: "Personal contact information for your seller account.",
    details: [
      "Use your legal full name as it appears on government ID.",
      "Mobile number is used for order and account notifications.",
    ],
  },
  {
    icon: Store,
    title: "Store details",
    summary: "How your shop appears on the marketplace.",
    details: [
      "Choose a memorable store name customers will recognize.",
      "Logo and banner help build trust — upload clear, high-quality images.",
      "TIN is optional but recommended for business sellers.",
    ],
  },
  {
    icon: MapPin,
    title: "Address",
    summary: "Your registered business or operating address.",
    details: [
      "This should match the address on your address proof document.",
      "Used for verification and compliance purposes.",
    ],
  },
  {
    icon: FileText,
    title: "Verification documents",
    summary: "Required for admin approval.",
    details: [
      "Government ID: national ID, passport, or driving licence.",
      "Business proof: registration certificate or trade licence.",
      "Address proof: utility bill or bank statement (recent).",
    ],
  },
  {
    icon: Landmark,
    title: "Bank & identity",
    summary: "Payout account and national ID number.",
    details: [
      "Bank account must be in the account holder's name.",
      "IFSC code is required for Indian bank transfers.",
      "National ID number must match your ID proof document.",
    ],
  },
];

export const ONBOARDING_GUIDE_TIPS = [
  "Applications are typically reviewed within 2–3 business days.",
  "You can track status on your profile page after submitting.",
  "If rejected, you can update details and resubmit from your profile.",
];
