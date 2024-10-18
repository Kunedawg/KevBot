const express = require("express");
const YAML = require("yamljs");
const path = require("path");
const swaggerUi = require("swagger-ui-express");

const router = express.Router();

const yamlFilePath = path.join(__dirname, "..", "docs", "kevbot-api.yml");
const swaggerDocument = YAML.load(yamlFilePath);
router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = router;
