// FILE: backend/src/config/cloudinary.ts
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
  resourceType: "image" | "video" | "raw" | "auto" = "auto",
  filename?: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: resourceType,
      timeout: 600000,
      // KEY FIX: Make all uploads publicly accessible
      access_mode: "public",
      type: "upload", // Ensure it's not 'authenticated'
    };

    const isLargeFile = buffer.length > 10 * 1024 * 1024;

    if (filename) {
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
      uploadOptions.public_id = `${nameWithoutExt}_${Date.now()}`;
    }

    // For PDFs, set the format explicitly
    if (resourceType === "raw" && filename?.toLowerCase().endsWith('.pdf')) {
      uploadOptions.format = "pdf";
    }

    if (isLargeFile) {
      uploadOptions.chunk_size = 10000000;
    }

    if (resourceType === "video") {
      uploadOptions.eager_async = true;
      uploadOptions.eager = [{ streaming_profile: "auto", format: "m3u8" }];
      uploadOptions.resource_type = "video";
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined
      ) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error("Upload failed with no result"));
        }
      }
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
  resourceType: "image" | "video" | "raw" = "image"
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

// Helper function to generate signed URLs for existing authenticated resources
// Use this for PDFs and videos that were uploaded before the fix
export const getSignedUrl = (
  publicId: string, 
  resourceType: "image" | "video" | "raw" = "raw",
  expiresIn: number = 3600 // Default 1 hour
): string => {
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    sign_url: true,
    type: "upload",
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
  });
};

// Helper to check if a URL is from Cloudinary and needs signing
export const isCloudinaryUrl = (url: string): boolean => {
  return url.includes('cloudinary.com');
};

// Helper to extract publicId from Cloudinary URL
export const extractPublicIdFromUrl = (url: string, resourceType: "image" | "video" | "raw"): string | null => {
  try {
    const regex = resourceType === "video" 
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