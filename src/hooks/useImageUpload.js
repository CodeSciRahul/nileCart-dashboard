import { useCallback, useState } from "react";
import { uploadImage } from "@/services/uploadService.js";
import { UPLOAD_FOLDERS } from "@/lib/uploadConstants.js";

/**
 * Reusable hook for direct-to-S3 image uploads with loading and error state.
 */
export function useImageUpload({ folder = UPLOAD_FOLDERS.PRODUCTS } = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const reset = useCallback(() => {
    setProgress(0);
    setError(null);
  }, []);

  const upload = useCallback(
    async (file) => {
      reset();
      setIsUploading(true);

      try {
        const result = await uploadImage(file, {
          folder,
          onProgress: setProgress,
        });

        return result;
      } catch (err) {
        const message = err.message || "Image upload failed.";
        setError(message);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [folder, reset]
  );

  return {
    upload,
    isUploading,
    progress,
    error,
    reset,
  };
}
