import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import { Database } from "./schema";

export function dbFactory(uri: string) {
  return new Kysely<Database>({
    dialect: new MysqlDialect({
      pool: createPool({ uri }),
    }),
  });
}

export type KevbotDb = Kysely<Database>;
