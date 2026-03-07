import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "video" | "raw" | "auto" = "image",
  filename?: string,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    let resolvedResourceType = resourceType;
    if (filename) {
      const ext = filename.split(".").pop()?.toLowerCase();
      if (ext === "pdf") resolvedResourceType = "image";
      else if (["mp4", "mov", "avi", "mkv"].includes(ext || ""))
        resolvedResourceType = "video";
      else if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || ""))
        resolvedResourceType = "image";
    }

    const uploadOptions: any = {
      folder,
      upload_preset: "ml_default",
      resource_type: resolvedResourceType,
      timeout: 600000,
      access_mode: "public",
      type: "upload",
      invalidate: true,
      overwrite: true,
    };

    const isLargeFile = buffer.length > 10 * 1024 * 1024;

    if (filename) {
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
      uploadOptions.public_id = `${nameWithoutExt}_${Date.now()}`;
    }

    if (isLargeFile) {
      uploadOptions.chunk_size = 10000000;
    }

    if (resolvedResourceType === "video") {
      uploadOptions.eager_async = true;
      uploadOptions.eager = [{ streaming_profile: "auto", format: "m3u8" }];
      uploadOptions.resource_type = "video";
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined,
      ) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error("Upload failed with no result"));
        }
      },
    );

    if (isLargeFile) {
      const chunkSize = 5 * 1024 * 1024;
      let offset = 0;

      const writeChunk = () => {
        let canContinue = true;
        while (offset < buffer.length && canContinue) {
          const end = Math.min(offset + chunkSize, buffer.length);
          const chunk = buffer.slice(offset, end);
          offset = end;

          if (offset >= buffer.length) {
            uploadStream.end(chunk);
            return;
          }

          canContinue = uploadStream.write(chunk);
        }

        if (!canContinue) {
          uploadStream.once("drain", writeChunk);
        }
      };

      writeChunk();
    } else {
      uploadStream.end(buffer);
    }
  });
};

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image",
) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};

export const getSignedUrl = (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "raw",
  expiresIn: number = 3600,
): string => {
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    sign_url: true,
    type: "upload",
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
  });
};

export const isCloudinaryUrl = (url: string): boolean => {
  return url.includes("cloudinary.com");
};

export const extractPublicIdFromUrl = (
  url: string,
  resourceType: "image" | "video" | "raw",
): string | null => {
  try {
    const regex =
      resourceType === "video"
        ? /\/video\/upload\/(?:v\d+\/)?(.+)\.\w+$/
        : resourceType === "raw"
          ? /\/raw\/upload\/(?:v\d+\/)?(.+)\.\w+$/
          : /\/image\/upload\/(?:v\d+\/)?(.+)\.\w+$/;

    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
};

export default cloudinary;
