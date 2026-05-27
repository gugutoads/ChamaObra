require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432
});

pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
  .then(r => {
    console.log('Tabelas criadas:', r.rows.map(t => t.table_name).join(', '));
  })
  .catch(e => console.error('Erro:', e.message))
  .finally(() => pool.end());