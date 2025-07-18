require("dotenv").config();
const { Pool } = require("pg");

const pgPool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: parseInt(process.env.PG_PORT),
});

pgPool.connect().then(client => {
    console.log("✅ PostgreSQL Connected to rbpu DB!");
    client.release();   // Release the connection back to the pool
}).catch(err => {
    console.error("❌ PostgreSQL Connection Failed:", err);
    return null;
})

module.exports = { pgPool };