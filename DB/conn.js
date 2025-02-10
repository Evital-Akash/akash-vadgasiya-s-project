const Pool = require("pg").Pool;
require("dotenv").config();

const conn = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

conn.connect((req, res) => {
  console.log("connection sucess..");
});

module.exports = conn;
