/** Mirrors backend upload folder types for a multi-vendor marketplace. */
export const UPLOAD_FOLDERS = {
  PRODUCTS: "products",
  STORE_LOGOS: "store-logos",
  STORE_BANNERS: "store-banners",
  PROFILES: "profiles",
  PLATFORM_BANNERS: "platform-banners",
  CATEGORIES: "categories",
};

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const ACCEPT_IMAGE_INPUT = ALLOWED_IMAGE_TYPES.join(",");
