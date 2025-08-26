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

// require("dotenv").config();
// const { Sequelize } = require("sequelize");

// const sequelize = new Sequelize(
//   process.env.PG_DATABASE,
//   process.env.PG_USER,
//   process.env.PG_PASSWORD,
//   {
//     host: process.env.PG_HOST,
//     dialect: "postgres",
//   }
// );

// module.exports = sequelize;

require("dotenv").config();
const { Sequelize } = require("sequelize");
const { Pool } = require("pg");

// Sequelize ORM instance
const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    dialect: "postgres",
    logging: false,
  }
);

// pg Pool (needed by connect-pg-simple)
const pgPool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

module.exports = { sequelize, pgPool };

