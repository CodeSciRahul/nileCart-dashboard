import { fromDatetimeLocal, toDatetimeLocal } from "@/lib/announcementUtils.js";
import { normalizeStoredImage, serializeStoredImage } from "@/lib/storedImage.js";

export { toDatetimeLocal, fromDatetimeLocal };


export const emptyDeepLink = {
  kind: "page",
  ref: "",
  url: "",
};

export const emptyTargeting = {
  devices: ["all"],
  auth: "all",
};

export const emptyBannerForm = {
  title: "",
  subtitle: "",
  description: "",
  type: "hero",
  image: null,
  mobileImage: null,
  ctaText: "Shop Now",
  ctaLink: "",
  deepLink: { ...emptyDeepLink },
  displayOrder: "0",
  priority: "0",
  startsAt: "",
  endsAt: "",
  isActive: true,
  targeting: { ...emptyTargeting },
};

export const getPublishStatus = ({ isActive, startsAt, endsAt }) => {
  if (!isActive) return { label: "Draft", variant: "secondary" };

  const now = Date.now();
  const start = startsAt ? new Date(startsAt).getTime() : null;
  const end = endsAt ? new Date(endsAt).getTime() : null;

  if (start && start > now) return { label: "Scheduled", variant: "default" };
  if (end && end < now) return { label: "Expired", variant: "secondary" };
  return { label: "Live", variant: "success" };
};

export const bannerFromApi = (banner) => ({
  title: banner.title || "",
  subtitle: banner.subtitle || "",
  description: banner.description || "",
  type: banner.type || "hero",
  image: normalizeStoredImage(banner.image),
  mobileImage: normalizeStoredImage(banner.mobileImage),
  ctaText: banner.ctaText || "Shop Now",
  ctaLink: banner.ctaLink || "",
  deepLink: {
    kind: banner.deepLink?.kind || "page",
    ref: banner.deepLink?.ref || "",
    url: banner.deepLink?.url || "",
  },
  displayOrder: String(banner.displayOrder ?? 0),
  priority: String(banner.priority ?? 0),
  startsAt: toDatetimeLocal(banner.startsAt),
  endsAt: toDatetimeLocal(banner.endsAt),
  isActive: banner.isActive ?? true,
  targeting: {
    devices: banner.targeting?.devices?.length
      ? [...banner.targeting.devices]
      : ["all"],
    auth: banner.targeting?.auth || "all",
  },
});

const buildDeepLinkPayload = (deepLink) => {
  if (!deepLink) return undefined;
  const kind = deepLink.kind || "page";
  const ref = deepLink.ref?.trim() || undefined;
  const url = deepLink.url?.trim() || undefined;
  if (!ref && !url) return undefined;
  return { kind, ...(ref ? { ref } : {}), ...(url ? { url } : {}) };
};

export const buildBannerPayload = (form) => ({
  title: form.title.trim(),
  subtitle: form.subtitle.trim() || undefined,
  description: form.description.trim() || undefined,
  type: form.type || "hero",
  image: serializeStoredImage(form.image),
  mobileImage: serializeStoredImage(form.mobileImage),
  ctaText: form.ctaText.trim() || "Shop Now",
  ctaLink: form.ctaLink.trim() || undefined,
  deepLink: buildDeepLinkPayload(form.deepLink),
  displayOrder: Number(form.displayOrder) || 0,
  priority: Number(form.priority) || 0,
  isActive: form.isActive,
  startsAt: fromDatetimeLocal(form.startsAt),
  endsAt: fromDatetimeLocal(form.endsAt),
  targeting: {
    devices: form.targeting?.devices?.length
      ? form.targeting.devices
      : ["all"],
    auth: form.targeting?.auth || "all",
  },
});
