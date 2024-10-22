import { minioClient } from "../configs/minio.config";

export const uploadImageToMinio = async (
  bucketName: string,
  objectName: string,
  file: Express.Multer.File
) => {
  try {
    const metadata = {
      "Content-Type": file.mimetype,
    };
    await minioClient.putObject(
      bucketName,
      objectName,
      file.buffer,
      file.size,
      metadata
    );
  } catch (error: any) {
    throw error;
  }
};

export const generatePreSignedUrl = (
  bucketName: string,
  objectName: string,
  expiry: number
) => {
  return minioClient.presignedGetObject(
    bucketName,
    objectName,
    24 * 60 * 60 * expiry
  );
};

export const removeImageFromMinio = async (
  bucketName: string,
  fileName: string
) => {
  try {
    const exists = await minioClient.statObject(bucketName, fileName);
    if (exists) {
      minioClient.removeObject(bucketName, fileName);
    }
    console.log(`${fileName} removed from bucket ${bucketName} successfully`);
  } catch (error: any) {
    console.log("Image does not exists in minio");
    console.error("Error in removeObjectFromMinio: ", error);
  }
};
