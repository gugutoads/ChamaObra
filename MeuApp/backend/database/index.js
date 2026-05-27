const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');

console.log('DB_CONFIG:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  max: 10,
  ssl: { rejectUnauthorized: false },
});

const db = drizzle(pool);

module.exports = { db, pool };