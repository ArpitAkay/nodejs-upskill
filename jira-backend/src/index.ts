import express from "express";
import router from "./routes/route";
import { createBucket } from "./configs/bucket.config";
import {
  MINIO_ATTACHMENTS_BUCKET_NAME,
  MINIO_PROFILE_IMAGES_BUCKET_NAME,
} from "./configs/env.config";
import { seedUsers } from "./seed/users.seed";
import { specs } from "./configs/swagger.config";
import swaggerUi from "swagger-ui-express";
import { seedPermissions } from "./seed/permission.seed";
import {
  getPermissionsForAdminRole,
  getPermissionsForNormalRole,
  seedRole,
} from "./seed/role.seed";

const port = 3000;

const app = express();

const createBuckets = async () => {
  await createBucket(MINIO_ATTACHMENTS_BUCKET_NAME);
  await createBucket(MINIO_PROFILE_IMAGES_BUCKET_NAME);
};

createBuckets().then(() => {
  console.log("Buckets created");
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

// For parsing application/json
app.use(express.json());

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const seedData = async () => {
  // seed permissions
  await seedPermissions();
  // seed roles
  await seedRole("admin", getPermissionsForAdminRole());
  await seedRole("normal", getPermissionsForNormalRole());
  // seed users
  seedUsers();
};

seedData().then(() => {
  console.log("Seeding Done");
});

app.use(router);

app.listen(port, function () {
  console.log(`Server is running on port http://localhost:${port}`);
});
