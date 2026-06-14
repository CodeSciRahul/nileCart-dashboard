/**
 * Client helpers for storedImageSchema: { url: string, key?: string }
 * Must match nileCart-server/models/schemas/storedImage.schema.js
 */

/** @typedef {{ url: string, key?: string }} StoredImage */

export const getImageUrl = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.url || "";
};

export const getImageKey = (image) => {
  if (!image || typeof image === "string") return "";
  return image.key || "";
};

/** After S3 upload — build a StoredImage for form state. */
export const toStoredImage = ({ fileUrl, key }) => {
  if (!fileUrl?.trim()) {
    throw new Error("Missing file URL after upload.");
  }

  if (fileUrl.includes("X-Amz-Signature=") || fileUrl.includes("X-Amz-Algorithm=")) {
    throw new Error("Invalid image URL: use fileUrl from the API, not uploadUrl.");
  }

  return serializeStoredImage({ url: fileUrl, key }) ?? { url: fileUrl.trim() };
};

/** Normalize API / legacy values into form state. */
export const normalizeStoredImage = (input) => {
  if (!input) return null;

  if (typeof input === "string") {
    const url = input.trim();
    return url ? { url, key: undefined } : null;
  }

  if (input.url?.trim()) {
    return {
      url: input.url.trim(),
      key: input.key?.trim() || undefined,
    };
  }

  return null;
};

export const normalizeStoredImages = (inputs) => {
  if (!Array.isArray(inputs)) return [];
  return inputs.map(normalizeStoredImage).filter(Boolean);
};

/**
 * Serialize a single image for API requests (logo, banner, category image, etc.).
 * Returns undefined when empty so callers can omit the field.
 */
export const serializeStoredImage = (input) => {
  const image = normalizeStoredImage(input);
  if (!image) return undefined;

  const payload = { url: image.url };
  if (image.key) {
    payload.key = image.key;
  }
  return payload;
};

/** Serialize an image array for API requests (product images, variant images). */
export const serializeStoredImages = (inputs) =>
  normalizeStoredImages(inputs).map((image) => {
    const payload = { url: image.url };
    if (image.key) {
      payload.key = image.key;
    }
    return payload;
  });

const SELLER_DOCUMENT_KEYS = ["idProof", "businessProof", "addressProof"];

/** Serialize seller.documents for API — matches Seller model storedImage fields. */
export const serializeSellerDocuments = (documents) => {
  if (!documents || typeof documents !== "object") return undefined;

  const result = {};

  for (const key of SELLER_DOCUMENT_KEYS) {
    const image = serializeStoredImage(documents[key]);
    if (image) result[key] = image;
  }

  return Object.keys(result).length ? result : undefined;
};

export const normalizeSellerDocuments = (documents) => {
  if (!documents || typeof documents !== "object") {
    return { idProof: null, businessProof: null, addressProof: null };
  }

  return {
    idProof: normalizeStoredImage(documents.idProof),
    businessProof: normalizeStoredImage(documents.businessProof),
    addressProof: normalizeStoredImage(documents.addressProof),
  };
};
