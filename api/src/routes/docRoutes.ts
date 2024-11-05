import express from "express";
import YAML from "yamljs";
import path from "path";
import swaggerUi from "swagger-ui-express";

const router = express.Router();
const yamlFilePath = path.join(__dirname, "..", "docs", "kevbot-api.yml");
const swaggerDocument = YAML.load(yamlFilePath);
router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
export default router;
