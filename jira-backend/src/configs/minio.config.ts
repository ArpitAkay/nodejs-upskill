import * as Minio from "minio";
import { MINIO_ACCESS_KEY, MINIO_SECRET_KEY } from "./env.config";

export const minioClient = new Minio.Client({
  endPoint: "127.0.0.1",
  port: 9000,
  useSSL: false,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});
