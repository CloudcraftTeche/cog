import cloudinary from "../config/cloudinary";


export const uploadVideo = async (
  fileBuffer: Buffer,
  folder = "videos"
): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "video",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Video upload failed"));
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    ).end(fileBuffer);
  });
};
