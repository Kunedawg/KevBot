import { Storage, Bucket } from "@google-cloud/storage";

const storage = new Storage({
  apiEndpoint: process.env.GCP_API_ENDPOINT,
});

const bucketName = process.env.GCP_AUDIO_BUCKET as string;
const bucket: Bucket = storage.bucket(bucketName);

export default bucket;
