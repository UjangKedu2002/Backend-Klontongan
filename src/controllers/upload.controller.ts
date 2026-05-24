import { Request, Response } from "express";
import { Readable } from "stream";

import cloudinary from "../config/cloudinary";

// UPLOAD IMAGE TO CLOUDINARY
export const uploadImage = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    const streamUpload = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "ecommerce/products",
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(result);
          }
        );

        Readable.from(req.file!.buffer).pipe(stream);
      });
    };

    const result = await streamUpload();

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        publicId: result.public_id,
        imageUrl: result.secure_url,
      },
    });
  } catch (error: any) {
    console.error("UPLOAD IMAGE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
