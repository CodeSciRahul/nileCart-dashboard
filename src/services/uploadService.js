import { apiClient } from "../lib/api.js";
import {
  ALLOWED_IMAGE_TYPES,
  UPLOAD_FOLDERS,
} from "../constants/uploads.js";

const normalizeContentType = (file) => {
  const type = file.type?.toLowerCase();

  if (type === "image/jpg") {
    return "image/jpeg";
  }

  return type;
};

/**
 * Validates the selected file before requesting a presigned URL.
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, message: "No file selected." };
  }

  const contentType = normalizeContentType(file);

  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    return {
      valid: false,
      message: "Invalid file type. Allowed types: JPEG, JPG, PNG, WEBP.",
    };
  }

  return { valid: true, contentType };
};

/**
 * Requests a short-lived presigned PUT URL from the backend.
 */
export const requestPresignedUploadUrl = async ({
  fileName,
  contentType,
  folder = UPLOAD_FOLDERS.PRODUCTS,
  documentType,
}) =>
  apiClient.post("/uploads/presign", {
    fileName,
    contentType,
    folder,
    documentType,
  });

/** Deletes an uploaded object from S3 using its stored key. */
export const deleteUploadedImage = (key) =>
  apiClient.delete("/uploads/delete", { data: { key } });

const parseS3ErrorMessage = (body) => {
  if (!body) return null;

  const code = body.match(/<Code>([^<]+)<\/Code>/)?.[1];
  const message = body.match(/<Message>([^<]+)<\/Message>/)?.[1];

  if (code === "AccessDenied" && message) {
    return message;
  }

  if (code === "SignatureDoesNotMatch") {
    return "Upload signature mismatch. Use PUT (not GET) on the presigned URL and keep Content-Type signed on both server and client.";
  }

  return message || body;
};

/**
 * Uploads bytes directly to S3 using the presigned URL.
 * Content-Type must match what was used when the URL was signed.
 */
export const putFileToS3 = async ({ uploadUrl, file, contentType, onProgress }) => {
  if (typeof onProgress === "function") {
    onProgress(10);
  }

  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": contentType,
    },
  });

  if (typeof onProgress === "function") {
    onProgress(100);
  }

  if (!response.ok) {
    const s3Body = await response.text().catch(() => "");
    const parsed = parseS3ErrorMessage(s3Body);
    const err = new Error(
      parsed || `Failed to upload image to storage (${response.status}).`
    );
    err.status = response.status;
    throw err;
  }
};

/**
 * End-to-end image upload: presign on the API, then PUT directly to S3.
 * Returns the permanent file URL and S3 object key for persistence.
 */
export const uploadImage = async (
  file,
  { folder = UPLOAD_FOLDERS.PRODUCTS, documentType, onProgress } = {}
) => {
  const validation = validateImageFile(file);

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  if (typeof onProgress === "function") {
    onProgress(0);
  }

  const presign = await requestPresignedUploadUrl({
    fileName: file.name,
    contentType: validation.contentType,
    folder,
    documentType,
  });

  if (typeof onProgress === "function") {
    onProgress(30);
  }

  await putFileToS3({
    uploadUrl: presign.uploadUrl,
    file,
    contentType: validation.contentType,
    onProgress: (value) => {
      if (typeof onProgress === "function") {
        onProgress(30 + Math.round(value * 0.7));
      }
    },
  });

  return {
    fileUrl: presign.fileUrl,
    key: presign.key,
    expiresIn: presign.expiresIn,
  };
};
