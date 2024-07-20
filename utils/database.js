/** @format */

const mySQL = require("mysql2/promise");
const connection = new mySQL.createConnection({
  host: "node1.aio.lol",
  port: 3306,
  user: "u8_FTPG3R47iq",
  password: "haQZNPalciQYZGQiwfr1k3.!",
  database: "s8_dnrp_core",
  keepAliveInitialDelay: 10000, // 0 by default.
  enableKeepAlive: true, // false by default.
});

// disable logging

module.exports = connection;