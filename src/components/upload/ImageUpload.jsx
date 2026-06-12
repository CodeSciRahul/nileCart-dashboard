import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { Label } from "@/components/ui/label.jsx";
import { useImageUpload } from "@/hooks/useImageUpload.js";
import { ACCEPT_IMAGE_INPUT, UPLOAD_FOLDERS } from "@/lib/uploadConstants.js";
import {
  getImageKey,
  getImageUrl,
  normalizeStoredImage,
  normalizeStoredImages,
  toStoredImage,
} from "@/lib/storedImage.js";
import { deleteUploadedImage, validateImageFile } from "@/services/uploadService.js";

/**
 * Reusable image picker that uploads directly to S3 via a presigned URL.
 * Value is a stored image object { url, key } or an array of them when multiple=true.
 */
export function ImageUpload({
  label = "Upload image",
  folder = UPLOAD_FOLDERS.PRODUCTS,
  value = null,
  onChange,
  multiple = false,
  disabled = false,
  helperText,
}) {
  const inputRef = useRef(null);
  const [localError, setLocalError] = useState(null);
  const [deletingKey, setDeletingKey] = useState(null);
  const { upload, isUploading, progress, error, reset } = useImageUpload({ folder });

  const images = multiple
    ? normalizeStoredImages(Array.isArray(value) ? value : value ? [value] : [])
    : normalizeStoredImage(value)
      ? [normalizeStoredImage(value)]
      : [];

  const displayError = localError || error;

  const emitChange = (nextImages) => {
    if (multiple) {
      onChange?.(nextImages);
      return;
    }

    onChange?.(nextImages[0] || null);
  };

  const appendImage = (storedImage) => {
    emitChange(multiple ? [...images, storedImage] : [storedImage]);
  };

  const removeImage = async (index) => {
    const image = images[index];
    if (!image) return;

    const key = getImageKey(image);

    setLocalError(null);

    if (key) {
      setDeletingKey(key);
      try {
        await deleteUploadedImage(key);
      } catch (err) {
        setLocalError(err.message || "Failed to delete image from storage.");
        return;
      } finally {
        setDeletingKey(null);
      }
    }

    emitChange(images.filter((_, i) => i !== index));
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (files.length === 0) return;

    setLocalError(null);
    reset();

    const selectedFiles = multiple ? files : [files[0]];

    for (const file of selectedFiles) {
      const validation = validateImageFile(file);

      if (!validation.valid) {
        setLocalError(validation.message);
        return;
      }

      try {
        const result = await upload(file);
        appendImage(toStoredImage(result));
      } catch (err) {
        setLocalError(err.message || "Image upload failed.");
        return;
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_IMAGE_INPUT}
          multiple={multiple}
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isUploading || Boolean(deletingKey)}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading || Boolean(deletingKey)}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Uploading {progress}%
            </>
          ) : (
            <>
              <ImagePlus className="mr-2 size-4" />
              Choose image
            </>
          )}
        </Button>

        {helperText ? (
          <p className="text-muted-foreground text-xs">{helperText}</p>
        ) : (
          <p className="text-muted-foreground text-xs">JPEG, PNG, or WEBP. Max upload via presigned URL.</p>
        )}
      </div>

      {displayError ? <p className="text-destructive text-sm">{displayError}</p> : null}

      {images.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {images.map((image, index) => {
            const imageKey = getImageKey(image);
            const isDeleting = deletingKey === imageKey;

            return (
              <div
                key={`${getImageUrl(image)}-${imageKey || index}`}
                className="relative size-20 overflow-hidden rounded-md border border-border"
              >
                <img src={getImageUrl(image)} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  className="absolute top-1 right-1 rounded-full bg-background/90 p-1 shadow-sm"
                  onClick={() => removeImage(index)}
                  disabled={disabled || isUploading || isDeleting}
                  aria-label="Remove image"
                >
                  {isDeleting ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <X className="size-3" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
