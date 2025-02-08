import { AppConfig, configFactory } from "../../src/config/config";
import fs from "fs";
import path from "path";
import { loudnessNormalize, verifyLoudnessNormalization } from "../../src/utils/audioUtils";
import { fixturePath } from "../utils";

let appConfig: AppConfig;

const TMP_DIR = path.join(__dirname, "tmp");
const tmpPath = (fileName: string) => path.join(TMP_DIR, fileName);

beforeAll(async () => {
  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
  }
  // process.env does not matter here, but it is needed to prevent configFactory from throwing
  process.env.GCP_API_ENDPOINT = `http://127.0.0.1:123`;
  process.env.GCP_TRACKS_BUCKET_NAME = "kevbot-tracks-testing";
  process.env.KEVBOT_API_ADDRESS = "0.0.0.0";
  process.env.KEVBOT_API_JWT_SECRET = "jwt_secret";
  process.env.KEVBOT_API_PORT = "3000";
  appConfig = configFactory();
}, 120000);

afterAll(async () => {
  if (fs.existsSync(TMP_DIR)) {
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
  }
});

describe("Test loudness normalization", () => {
  it("should pass the normalization check on files that are already known to be normalized", async () => {
    const alreadyNormalizedFilesDir = fixturePath("known-normalized-files");
    const files = fs.readdirSync(alreadyNormalizedFilesDir);
    expect(files.length).toBe(5);
    for (const file of files) {
      const filePath = path.join(alreadyNormalizedFilesDir, file);
      await verifyLoudnessNormalization(filePath, appConfig.config.acceptableIntegratedLoudnessBand);
    }
  });

  it("should normalize without throwing", async () => {
    const filesToNormalizeDir = fixturePath("known-unnormalized-files");
    const files = fs.readdirSync(filesToNormalizeDir);
    const tmpNormalizedDir = tmpPath("normalized");
    if (!fs.existsSync(tmpNormalizedDir)) {
      fs.mkdirSync(tmpNormalizedDir, { recursive: true });
    }
    expect(files.length).toBe(8);
    for (const file of files) {
      const filePath = path.join(filesToNormalizeDir, file);
      const filePathNormalized = path.join(tmpNormalizedDir, file);
      await loudnessNormalize(filePath, filePathNormalized);
    }
  });

  it("files that were normalized should pass verification", async () => {
    const normalizedFilesDir = tmpPath("normalized");
    const files = fs.readdirSync(normalizedFilesDir);
    expect(files.length).toBe(8);
    for (const file of files) {
      const filePath = path.join(normalizedFilesDir, file);
      await verifyLoudnessNormalization(filePath, appConfig.config.acceptableIntegratedLoudnessBand);
    }
  });
});
