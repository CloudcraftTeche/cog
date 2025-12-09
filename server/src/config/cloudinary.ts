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
    };
    const isLargeFile = buffer.length > 10 * 1024 * 1024;
    if (filename) {
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
      uploadOptions.public_id = `${nameWithoutExt}_${Date.now()}`;
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
export default cloudinary;
