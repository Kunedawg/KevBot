const mysql = require("mysql");

/**
 * turns a query into an async operation
 * @param {mysql.Pool} connection
 * @param {string} queryStr
 */
function asyncQuery(connection, queryStr) {
  return new Promise((resolve, reject) => {
    connection.query(queryStr, (err, results) => {
      if (err) {
        return reject(`SQL query "${queryStr}" failed!\n` + err);
      } else {
        return resolve(results);
      }
    });
  });
}

module.exports = { asyncQuery };
