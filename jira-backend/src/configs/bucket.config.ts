import { minioClient } from "./minio.config";

export const createBucket = async (bucketName: string) => {
  try {
    const exists = await minioClient.bucketExists(bucketName);

    if (exists) {
      console.log("Bucket " + bucketName + " exists.");
    } else {
      await minioClient.makeBucket(bucketName, "us-east-1");
      console.log("Bucket " + bucketName + ' created in "us-east-1".');
    }
  } catch (error: any) {
    console.log(error);
  }
};
