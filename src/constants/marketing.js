import { CalendarClock, Image, Link2 } from "lucide-react";

export const BANNER_TYPES = [
  { value: "hero", label: "Hero Banner" },
  { value: "promotional", label: "Promotional Banner" },
  { value: "category", label: "Category Banner" },
  { value: "offer", label: "Offer Banner" },
  { value: "collection", label: "Collection Banner" },
  { value: "flash_sale", label: "Flash Sale Banner" },
];

export const ANNOUNCEMENT_TYPES = [
  { value: "top_bar", label: "Top Notification Bar" },
  { value: "sticky", label: "Sticky Announcement" },
  { value: "campaign", label: "Campaign Message" },
  { value: "seasonal", label: "Seasonal Offer" },
  { value: "shipping", label: "Shipping Update" },
  { value: "maintenance", label: "Maintenance Notice" },
];

export const DEEP_LINK_KINDS = [
  { value: "page", label: "Custom page" },
  { value: "product", label: "Product" },
  { value: "category", label: "Category" },
  { value: "brand", label: "Brand" },
  { value: "collection", label: "Collection" },
  { value: "external", label: "External URL" },
];

export const TARGETING_AUTH_OPTIONS = [
  { value: "all", label: "Everyone" },
  { value: "guest", label: "Guests only" },
  { value: "authenticated", label: "Logged-in users" },
];

export const BANNER_GUIDE_STEPS = [
  {
    icon: Image,
    title: "Pick a banner type",
    text: "Hero banners power the homepage carousel. Use other types for category or offer placements.",
  },
  {
    icon: Link2,
    title: "Upload images & deep link",
    text: "Add a desktop image (required) and optional mobile crop. Link to a product, category, or URL.",
  },
  {
    icon: CalendarClock,
    title: "Schedule & publish",
    text: "Set start/end times and targeting so campaigns go live without redeploys.",
  },
];
