const express = require("express");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
require("dotenv").config();

const app = express();

// open api docs
const yamlFilePath = path.join(__dirname, "..", "docs", "openapi.yaml");
const swaggerDocument = YAML.load(yamlFilePath);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

let server = app.listen(process.env.PORT, process.env.ADDRESS, () =>
  console.log(`API is listening on ${server.address().address}:${server.address().port}.`)
);
