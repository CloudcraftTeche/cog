import cloudinary from "../config/cloudinary";


export const uploadImage = async (
  fileBuffer: Buffer,
  folder = "images"
): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Image upload failed"));
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    ).end(fileBuffer);
  });
};
