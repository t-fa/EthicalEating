// client.js sets up the database client for queries and provides an
// "Am I connected?" sanity check with describeTables(). Could add
// more in the way of connection management if needed.

// Set-up adapted from docs here: https://www.npmjs.com/package/mysql2.

const mysql = require("mysql2");

// Create a connection pool.
// Right now this is configured to work with Docker where the
// database host is named "db". On flip this would change to
// localhost, the user would change to your userid, and the
// password to your flip database password.

// TODO: it is generally a best practice to keep passwords and
// secrets out of the repository. We can create a top-level
// configuration file to hold the createPool instantiation
// object. For now for development and testing, this is fine.
const pool = mysql.createPool({
  host: "db",
  port: "3306",
  user: "root",
  password: "secret",
  database: "EthicalEating",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// describeTables runs DESCRIBE Users and DESCRIBE RecipeBooks so we can know
// the DB connection is working and the initialization script was successful.

const describeTables = () => {
  // Describe the two tables we should be creating so far in database-definitions.sql.
  pool.query("DESCRIBE Users;", function (err, results, fields) {
    if (err) {
      console.log(`error: ${err}`); // any error
    }
    console.log(results); // results contains rows returned by server
    // console.log(fields); // fields contains extra meta data about results, if available
  });
  pool.query("DESCRIBE RecipeBooks;", function (err, results, fields) {
    if (err) {
      console.log(`error: ${err}`); // any error
    }
    console.log(results); // results contains rows returned by server
    // console.log(fields); // fields contains extra meta data about results, if available
  });
};

module.exports = { describeTables };
