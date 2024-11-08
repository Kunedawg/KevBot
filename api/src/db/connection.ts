import knex from "knex";
import { Knex } from "knex";
import secrets from "../config/secrets";

const db: Knex = knex({
  client: "mysql2",
  connection: secrets.DB_CONNECTION_STRING,
});

export default db;
