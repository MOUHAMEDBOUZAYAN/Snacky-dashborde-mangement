"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import {
  deleteUploadedImage,
  publicIdFromCloudinaryUrl,
  uploadImage,
} from "@/features/uploads/api";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  className,
}: ImageUploadProps) {
  const { locale } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lastPublicId, setLastPublicId] = useState<string | null>(null);

  const preview = localPreview || value || null;
  const busy = disabled || uploading;

  function openPicker() {
    if (busy) return;
    inputRef.current?.click();
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;

    if (!ACCEPTED_TYPES.has(file.type)) {
      toast.error(t("imageUploadInvalidType", locale));
      return;
    }

    if (file.size > MAX_BYTES) {
      toast.error(t("imageUploadTooLarge", locale));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setUploading(true);

    try {
      const result = await uploadImage(file);
      setLastPublicId(result.publicId);
      onChange(result.url);
      setLocalPreview(null);
      URL.revokeObjectURL(objectUrl);
      toast.success(t("imageUploadSuccess", locale));
    } catch {
      setLocalPreview(null);
      URL.revokeObjectURL(objectUrl);
      toast.error(t("imageUploadError", locale));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (busy) return;

    const publicId =
      lastPublicId ?? (value ? publicIdFromCloudinaryUrl(value) : null);

    onChange("");
    setLocalPreview(null);
    setLastPublicId(null);

    if (publicId) {
      try {
        await deleteUploadedImage(publicId);
      } catch {
        // Non-blocking — form imageUrl is already cleared.
      }
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={busy}
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
        }}
      />

      <div
        role="button"
        tabIndex={busy ? -1 : 0}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (busy) return;
          void handleFile(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-brand-orange-200 bg-brand-orange-50/40 px-4 py-6 text-center transition-colors",
          busy
            ? "pointer-events-none opacity-70"
            : "hover:border-brand-orange-400 hover:bg-brand-orange-50",
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <>
            <ImagePlus className="size-8 text-brand-orange-600" />
            <p className="text-sm font-medium text-brand-charcoal">
              {t("imageUploadChoose", locale)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("imageUploadHint", locale)}
            </p>
          </>
        )}

        {uploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/75 backdrop-blur-[1px]">
            <Loader2 className="size-6 animate-spin text-brand-orange-600" />
            <p className="text-sm font-medium text-brand-charcoal">
              {t("imageUploading", locale)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={openPicker}
          className="border-brand-orange-200"
        >
          {preview
            ? t("imageUploadReplace", locale)
            : t("imageUploadChoose", locale)}
        </Button>
        {preview ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => {
              void handleRemove();
            }}
            className="gap-1.5 text-destructive hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
            {t("imageUploadRemove", locale)}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
