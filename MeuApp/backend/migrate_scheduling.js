const db = require('./database/database');

async function migrate() {
  try {
    console.log('Adicionando colunas de agendamento à tabela propostas...');
    await db.query(`
      ALTER TABLE propostas
      ADD COLUMN IF NOT EXISTS data_agendada DATE,
      ADD COLUMN IF NOT EXISTS horario_agendado VARCHAR(255)
    `);
    console.log('Migração concluída com sucesso!');
  } catch (err) {
    console.error('Erro na migração:', err);
    // Se o MySQL não suportar ADD COLUMN IF NOT EXISTS (versões antigas),
    // tentamos adicionar individualmente e ignoramos se a coluna já existir.
    try {
      await db.query('ALTER TABLE propostas ADD COLUMN data_agendada DATE');
      console.log('Coluna data_agendada adicionada.');
    } catch (e) {
      if (e.errno !== 1060) throw e; // 1060 = Duplicate column name
    }
    try {
      await db.query('ALTER TABLE propostas ADD COLUMN horario_agendado VARCHAR(255)');
      console.log('Coluna horario_agendado adicionada.');
    } catch (e) {
      if (e.errno !== 1060) throw e;
    }
  }
}

migrate().then(() => process.exit());
