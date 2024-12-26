import { Storage, Bucket } from "@google-cloud/storage";

const storage = new Storage({
  apiEndpoint: process.env.GCP_API_ENDPOINT,
});

const bucketName = process.env.GCP_TRACKS_BUCKET_NAME as string;
const bucket: Bucket = storage.bucket(bucketName);

export const tracksBucketFactory = (gcpApiEndpoint: string, tracksBucketName: string) => {
  const storage = new Storage({
    apiEndpoint: gcpApiEndpoint,
  });
  return storage.bucket(tracksBucketName);
};

export default bucket;
