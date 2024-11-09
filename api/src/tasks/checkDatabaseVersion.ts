import { db } from "../db/connection";
import config from "../config/config";

export const checkDatabaseVersion = async () => {
  console.log(`[${new Date().toISOString()}] Checking database version...`);
  const data = await db.selectFrom("db_version").selectAll().orderBy("applied_at", "desc").limit(1).execute();
  const dbVersion = data[0].version;
  if (dbVersion !== config.expectedDbVersion) {
    throw new Error(
      `Database version mismatch: expected ${config.expectedDbVersion}, but found ${dbVersion}. Please update database or API accordingly.`
    );
  }
  console.log(`Database at version: ${config.expectedDbVersion}.`);
};
