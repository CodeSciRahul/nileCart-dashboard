/** Client-side helpers matching backend { url, key } image shape. */

export const getImageUrl = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.url || "";
};

export const getImageKey = (image) => {
  if (!image || typeof image === "string") return "";
  return image.key || "";
};

export const toStoredImage = ({ fileUrl, key }) => {
  if (!fileUrl?.trim()) {
    throw new Error("Missing file URL after upload.");
  }

  // Presigned upload URLs expire and must never be saved as the image URL.
  if (fileUrl.includes("X-Amz-Signature=") || fileUrl.includes("X-Amz-Algorithm=")) {
    throw new Error("Invalid image URL: use fileUrl from the API, not uploadUrl.");
  }

  return {
    url: fileUrl.trim(),
    key: key?.trim() || undefined,
  };
};

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
