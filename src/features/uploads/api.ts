import { api } from "@/lib/api";

export interface UploadResult {
  url: string;
  publicId: string;
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<UploadResult>("/uploads", formData);
  return data;
}

export async function deleteUploadedImage(publicId: string): Promise<void> {
  const encoded = publicId
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  await api.delete(`/uploads/${encoded}`);
}

/** Best-effort extract of Cloudinary public_id from a secure_url. */
export function publicIdFromCloudinaryUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const marker = "/upload/";
    const idx = pathname.indexOf(marker);
    if (idx === -1) return null;
    let rest = pathname.slice(idx + marker.length);
    // Drop version segment: v1234567890/
    rest = rest.replace(/^v\d+\//, "");
    // Drop file extension
    rest = rest.replace(/\.[a-zA-Z0-9]+$/, "");
    return rest.length > 0 ? decodeURIComponent(rest) : null;
  } catch {
    return null;
  }
}
