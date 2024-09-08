const { Storage } = require("@google-cloud/storage");

const storage = new Storage({
  apiEndpoint: process.env.GCP_API_ENDPOINT,
  //   projectId: "test",
});
const bucket = storage.bucket(process.env.GCP_AUDIO_BUCKET);

module.exports = bucket;
