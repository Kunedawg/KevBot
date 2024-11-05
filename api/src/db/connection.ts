import knex from "knex";
import { Knex } from "knex";

const db: Knex = knex({
  client: "mysql2",
  connection: process.env.DB_CONNECTION_STRING as string,
});

export default db;
