import { Storage } from "@google-cloud/storage";

export const tracksBucketFactory = (gcpApiEndpoint: string, tracksBucketName: string) => {
  const storage = new Storage({
    apiEndpoint: gcpApiEndpoint,
  });
  return storage.bucket(tracksBucketName);
};
