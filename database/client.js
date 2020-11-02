// client.js sets up the database client for queries. Could add
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

// When connecting to the MySQL database on Heroku, the @host, @user, @password,
// and @database are provided to the app as environmental variables. Use these
// variables if they are set. Otherwise, use the default values for testing.
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || "db",
  port: "3306",
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "secret",
  database: process.env.DATABASE_NAME || "EthicalEating",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = { pool };
