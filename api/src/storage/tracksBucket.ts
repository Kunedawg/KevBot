import { Storage } from "@google-cloud/storage";

export const tracksBucketFactory = (gcpApiEndpoint: string, tracksBucketName: string) => {
  const storage = new Storage({
    projectId: "TODO-CHANGE-THIS",
    apiEndpoint: gcpApiEndpoint,
  });
  return storage.bucket(tracksBucketName);
};
