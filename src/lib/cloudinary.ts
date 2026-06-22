import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export async function uploadImage(fileBase64: string, folder = "owl-print") {
  const res = await cloudinary.uploader.upload(fileBase64, { folder });
  return { url: res.secure_url, publicId: res.public_id };
}
