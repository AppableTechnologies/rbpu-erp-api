// require("dotenv").config();
// const { Pool } = require("pg");

// const pgPool = new Pool({
//     user: process.env.PG_USER,
//     host: process.env.PG_HOST,
//     database: process.env.PG_DATABASE,
//     password: process.env.PG_PASSWORD,
//     port: parseInt(process.env.PG_PORT),
// });

// pgPool.connect().then(client => {
//     console.log("✅ PostgreSQL Connected to rbpu DB!");
//     client.release();   // Release the connection back to the pool
// }).catch(err => {
//     console.error("❌ PostgreSQL Connection Failed:", err);
//     return null;
// })

// module.exports = { pgPool };

require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST,
    dialect: "postgres",
  }
);

module.exports = sequelize;
