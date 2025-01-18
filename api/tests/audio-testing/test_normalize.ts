import { normalizeAudio } from "../../src/utils/utils";
import path from "path";

const myPath = (fileName: string) => path.join(__dirname, fileName);

normalizeAudio(myPath("test_varying_loudness.mp3"), myPath("test_varying_loudness_normalized.mp3"));
