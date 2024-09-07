const knex = require("knex")({
  client: "mysql2",
  connection: process.env.DB_CONNECTION_STRING,
});

module.exports = knex;
