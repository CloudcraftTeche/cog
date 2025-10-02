import cloudinary from "../../../config/cloudinary";
import { Request, Response } from "express";

export const cloudinaryVideoUploadSignature = (
  req: Request,
  res: Response
): any => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res
        .status(500)
        .json({ error: "Cloudinary credentials not configured" });
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const timestamp = Math.round(Date.now() / 1000);
    const folder = "assignment_files";

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      apiSecret
    );

    return res.json({
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
    });
  } catch (error) {
    console.error("Cloudinary signature generation failed:", error);
    return res
      .status(500)
      .json({ error: "Failed to generate upload signature" });
  }
};
