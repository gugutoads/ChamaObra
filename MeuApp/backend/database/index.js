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

// 🔥 SISTEMA DE AUTO-CURA: Adiciona a coluna telefone se ela não existir
async function migrateDatabase() {
  try {
    console.log('SISTEMA: Verificando atualizações do banco de dados...');
    // Adiciona colunas essenciais se elas não existirem
    await pool.query('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);');
    await pool.query('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS photo TEXT;');
    console.log('SISTEMA: Banco de dados atualizado com sucesso!');
  } catch (err) {
    console.error('SISTEMA ERRO NA MIGRAÇÃO:', err.message);
  }
}

migrateDatabase();

module.exports = { db, pool };