import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import { Database } from "./schema";

export const db = new Kysely<Database>({
  dialect: new MysqlDialect({
    pool: createPool({
      uri: process.env.DB_CONNECTION_STRING,
    }),
  }),
});
