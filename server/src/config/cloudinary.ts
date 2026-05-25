import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type CloudinaryResourceType = "image" | "video" | "raw";

const EXTENSION_RESOURCE_MAP: Record<string, CloudinaryResourceType> = {
  pdf: "raw",
  jpg: "image", jpeg: "image", png: "image",
  gif: "image", webp: "image", svg: "image",
  mp4: "video", mov: "video", avi: "video",
  mkv: "video", webm: "video",
};

const resolveResourceType = (filename: string): CloudinaryResourceType => {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_RESOURCE_MAP[ext] ?? "raw";
};

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  /**
   * @deprecated Use `publicId` instead.
   * Backward-compatible alias used by older controllers.
   */
  public_id: string;
  /**
   * @deprecated Use `secureUrl` instead.
   * Backward-compatible alias used by older controllers.
   */
  secure_url: string;
  bytes: number;
  resourceType: CloudinaryResourceType;
}

export const uploadToCloudinary = (
buffer: Buffer, originalName: string, folder: string = "uploads", originalname?: any,
): Promise<UploadResult> => {
  const resourceType = resolveResourceType(originalName);

  const sanitized = originalName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_");

  const publicId = `${folder}/${sanitized}_${Date.now()}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        public_id: publicId,
        ...(resourceType === "video" && {
          eager_async: true,
          eager: [{ streaming_profile: "auto", format: "m3u8" }],
        }),
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        if (!result?.public_id || !result?.secure_url)
          return reject(new Error(`Cloudinary response missing fields. Got: ${Object.keys(result ?? {}).join(", ")}`));

        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          public_id: result.public_id, // Backward compatibility
          secure_url: result.secure_url, // Backward compatibility
          bytes: result.bytes ?? buffer.length,
          resourceType,
        });
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: CloudinaryResourceType = "image",
): Promise<void> => {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Cloudinary delete failed for "${publicId}". Result: ${result.result}`);
  }
};