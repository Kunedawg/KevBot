// import { Kysely, MysqlDialect } from "kysely";
// import { createPool } from "mysql2";
// import { Database } from "./schema";

// console.log(process.env.DB_CONNECTION_STRING);

// export const db = new Kysely<Database>({
//   dialect: new MysqlDialect({
//     pool: createPool({
//       uri: process.env.DB_CONNECTION_STRING,
//     }),
//   }),
// });

// connection.ts
import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import { Database } from "./schema";

// export let db: Kysely<Database> | null = null;
export let db: Kysely<Database>;

export function initDb(uri: string) {
  db = new Kysely<Database>({
    dialect: new MysqlDialect({
      pool: createPool({ uri }),
    }),
  });
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error("DB not initialized!");
  }
  return db;
}
