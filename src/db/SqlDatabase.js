const mysql = require("mysql2");

class SqlDatabase {
  /**
   * turns piping into an async operation
   * @param {mysql.createPool.config} connectionConfig
   */
  constructor(connectionConfig) {
    this.connection = mysql.createPool(connectionConfig);
  }

  /**
   * turns a query into an async operation
   * @param {string} queryStr
   */
  asyncQuery(queryStr) {
    return new Promise((resolve, reject) => {
      this.connection.query(queryStr, (err, results) => {
        if (err) {
          return reject(`SQL query "${queryStr}" failed!\n` + err);
        } else {
          return resolve(results);
        }
      });
    });
  }
}

module.exports = { SqlDatabase };
