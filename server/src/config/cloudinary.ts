import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string,
  resourceType: "image" | "video" | "raw" = "image",
  filename?: string
) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadOptions: any = {
        folder,
        resource_type: resourceType,
        access_mode: "public",
      };
      if (resourceType === "image") {
        uploadOptions.quality = "auto:good";
        uploadOptions.fetch_format = "auto";
      }
      if (resourceType === "raw" && filename) {
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
        const fileExtension = filename.split(".").pop()?.toLowerCase();
        uploadOptions.type = "upload";
        uploadOptions.access_mode = "public";
        if (fileExtension === "pdf") {
          uploadOptions.public_id = `${nameWithoutExt}_${Date.now()}.pdf`;
          uploadOptions.format = "pdf";
        } else {
          uploadOptions.public_id = `${nameWithoutExt}_${Date.now()}`;
        }
      }
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve({
              secure_url: result?.secure_url,
              public_id: result?.public_id,
              url: result?.url,
              format: result?.format,
            });
          }
        }
      );
      const bufferStream = Readable.from(fileBuffer);
      bufferStream.pipe(uploadStream);
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new Error(`Cloudinary upload failed: ${JSON.stringify(error)}`);
  }
};
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    const resourceType = publicId.includes("/video/") ? "video" : "raw";
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error(
      `Failed to delete from Cloudinary: ${JSON.stringify(error)}`
    );
  }
};
export default cloudinary;
