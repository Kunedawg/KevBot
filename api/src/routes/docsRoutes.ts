import express from "express";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";

export function docsRoutesFactory(swaggerYamlPath: string) {
  const router = express.Router();
  const swaggerDocument = YAML.load(swaggerYamlPath);
  router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  return router;
}
