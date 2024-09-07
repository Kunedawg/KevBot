const express = require("express");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const { Storage } = require("@google-cloud/storage");
require("dotenv").config();

const app = express();

// env vars
console.log("PORT:", process.env.PORT);
console.log("ADDRESS:", process.env.ADDRESS);
console.log("GCP_API_ENDPOINT:", process.env.GCP_API_ENDPOINT);
console.log("DB_CONNECTION_STRING:", process.env.DB_CONNECTION_STRING);
console.log("");

// open api docs
const yamlFilePath = path.join(__dirname, "..", "docs", "openapi3.yml");
const swaggerDocument = YAML.load(yamlFilePath);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// google cloud storage
let audio_file;
async function run() {
  // Creates a client
  const storage = new Storage({
    apiEndpoint: process.env.GCP_API_ENDPOINT,
    projectId: "test",
  });

  // Lists all buckets in the current project
  const [buckets] = await storage.getBuckets();
  console.log("Buckets:");
  buckets.forEach((bucket) => {
    console.log(bucket.id);
  });

  const [content] = await storage.bucket("kevbot-local-audio").file("test.txt").download();
  console.log("Contents:");
  console.log(content.toString());

  console.log("Exists:");
  console.log(await storage.bucket("kevbot-local-audio").file("test.txt").exists());

  [audio_file] = await storage.bucket("kevbot-local-audio").file("belt.mp3").download();
}
run().catch(console.error);
// knex
// const knex = require("knex")({
//   client: "mysql2",
//   connection: {
//     host: "db",
//     user: "root",
//     password: "1",
//     database: "defaultdb",
//     port: 25060,
//   },
// });

const knex = require("knex")({
  client: "mysql2",
  connection: process.env.DB_CONNECTION_STRING,
});

// Fetch the audio_name for the audio_id 1551
knex("audio")
  .select("audio_name")
  .where("audio_id", 1551)
  .then((rows) => {
    if (rows.length > 0) {
      console.log("Audio name:", rows[0].audio_name);
    } else {
      console.log("No record found with audio_id 1551");
    }
  })
  .catch((error) => {
    console.error("Error fetching audio name:", error);
  })
  .finally(() => {
    knex.destroy(); // Close the connection after the query is done
  });

const audioMetaData = [
  {
    id: 1,
    name: "absoluteonice",
    duration: 4.0,
  },
  {
    id: 2,
    name: "belt",
    duration: 7.0,
  },
];

const fileMap = { 1: "absoluteonice.mp3", 2: "belt.mp3" };

// Define a route for retrieving audio files with optional metadata
app.get("/audio/:audioId", (req, res) => {
  console.log("here!");
  const fileId = req.params.audioId;
  // const includeMetadata = req.query.metadata === "true";

  // Find the audio data by ID
  const audio = audioMetaData.find((item) => item.id === fileId);

  if (!audio) {
    return res.status(404).json({ error: "Audio not found" });
  }

  return res.json(audio);

  // if (includeMetadata) {
  //   // If metadata is requested, return both metadata and the file URL
  //   return res.json(audio);
  // } else {
  //   // If metadata is not requested, map the ID to the file name and return the file URL
  //   const fileName = `${fileId}.mp3`;
  //   const fileUrl = `/audio/${fileName}`;
  //   return res.json({ fileUrl });
  // }
});

app.get("/audio/:audioId/download", (req, res) => {
  const fileName = "belt.mp3";
  const fileId = req.params.id;
  const filePath = path.join(__dirname, fileName);
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(404).send("File not found");
    }
  });
});

app.get("/audio/:audioId/download2", (req, res) => {
  try {
    const storage = new Storage({
      apiEndpoint: process.env.GCP_API_ENDPOINT,
      projectId: "test",
    });
    // Get the file from the bucket
    const bucket = storage.bucket("kevbot-local-audio");
    const file = bucket.file("belt.mp3");

    // Pipe the file as a readable stream to the response
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", `attachment; filename=belt.mp3`);
    file
      .createReadStream()
      .on("error", (err) => {
        console.error("Error downloading the file:", err);
        res.status(500).send("Error downloading the file");
      })
      .pipe(res)
      .on("finish", () => {
        console.log("File successfully sent");
      });
  } catch (err) {
    console.error("Error handling the request:", err);
    res.status(500).send("Server error");
  }
});

let server = app.listen(process.env.PORT, process.env.ADDRESS, () =>
  console.log(`API is listening on ${server.address().address}:${server.address().port}.`)
);
