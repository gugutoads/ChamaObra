const express = require('express');
const cors = require('cors');
// No Vercel, variáveis de ambiente já estão disponíveis via process.env

// Importar banco para iniciar conexão
require('./database');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Webhook do Stripe DEVE vir antes do express.json() para receber o body bruto
const { handleWebhook } = require('./controllers/stripeWebhookController');
app.post('/api/pagamentos/webhook', express.raw({type: 'application/json'}), handleWebhook);

app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/servicos', require('./routes/servicoRoutes'));
app.use('/api/propostas', require('./routes/propostaRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/pagamentos', require('./routes/pagamentoRoutes'));

// Endpoint de diagnóstico
app.get('/api/test', async (req, res) => {
  try {
    const { pool } = require('./database');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as agora');
    client.release();
    res.json({ status: 'Banco conectado!', hora: result.rows[0].agora });
  } catch (err) {
    res.json({ erro: err.message, codigo: err.code, host: process.env.DB_HOST });
  }
});

// Endpoint para criar tabelas
app.get('/api/setup', async (req, res) => {
  try {
    const { pool } = require('./database');
    const client = await pool.connect();

    // Dropar tabelas existentes
    await client.query(`DROP TABLE IF EXISTS pagamentos CASCADE`);
    await client.query(`DROP TABLE IF EXISTS mensagens CASCADE`);
    await client.query(`DROP TABLE IF EXISTS propostas CASCADE`);
    await client.query(`DROP TABLE IF EXISTS servicos CASCADE`);
    await client.query(`DROP TABLE IF EXISTS usuarios CASCADE`);

    // Criar tabelas com nomes case-sensitive usando ""
    await client.query(`
      CREATE TABLE "usuarios" (
        "id" SERIAL PRIMARY KEY,
        "nome" VARCHAR(100),
        "email" VARCHAR(100) NOT NULL,
        "senha" VARCHAR(255) NOT NULL,
        "cpf" VARCHAR(20),
        "tipo" VARCHAR(20) NOT NULL,
        "endereco" TEXT,
        "servico" TEXT,
        "experiencia" TEXT,
        "telefone" VARCHAR(20),
        "photo" TEXT
      );

      CREATE TABLE "servicos" (
        "id" SERIAL PRIMARY KEY,
        "clienteId" INTEGER NOT NULL,
        "titulo" TEXT,
        "descricao" TEXT,
        "metragem" VARCHAR(50),
        "categoria" VARCHAR(100),
        "urgencia" VARCHAR(50),
        "materiais" TEXT,
        "endereco" TEXT,
        "status" VARCHAR(20) DEFAULT 'EM_ANDAMENTO',
        "valor" DECIMAL(10, 2),
        "fotos" JSONB,
        "criado_em" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE "propostas" (
        "id" SERIAL PRIMARY KEY,
        "servicoId" INTEGER NOT NULL,
        "prestadorId" INTEGER NOT NULL,
        "valor" DECIMAL(10, 2),
        "prazo" VARCHAR(255),
        "descricao" TEXT,
        "status" VARCHAR(20) DEFAULT 'PENDENTE',
        "data_agendada" DATE,
        "horario_agendado" VARCHAR(255),
        "criado_em" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE "mensagens" (
        "id" SERIAL PRIMARY KEY,
        "servicoId" INTEGER NOT NULL,
        "propostaId" INTEGER,
        "remetenteId" INTEGER NOT NULL,
        "destinatarioId" INTEGER NOT NULL,
        "mensagem" TEXT NOT NULL,
        "lida" BOOLEAN DEFAULT false,
        "created_at" TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE "pagamentos" (
        "id" SERIAL PRIMARY KEY,
        "propostaId" INTEGER NOT NULL,
        "valor" DECIMAL(10, 2) NOT NULL,
        "status" VARCHAR(50) DEFAULT 'PENDENTE',
        "metodo_pagamento" VARCHAR(50) DEFAULT 'ESCROW',
        "data_pagamento" TIMESTAMP,
        "data_criacao" TIMESTAMP DEFAULT NOW()
      );

      ALTER TABLE "servicos" ADD CONSTRAINT fk_servicos_cliente FOREIGN KEY ("clienteId") REFERENCES "usuarios"("id");
      ALTER TABLE "propostas" ADD CONSTRAINT fk_propostas_servico FOREIGN KEY ("servicoId") REFERENCES "servicos"("id");
      ALTER TABLE "propostas" ADD CONSTRAINT fk_propostas_prestador FOREIGN KEY ("prestadorId") REFERENCES "usuarios"("id");
      ALTER TABLE "mensagens" ADD CONSTRAINT fk_mensagens_servico FOREIGN KEY ("servicoId") REFERENCES "servicos"("id");
      ALTER TABLE "mensagens" ADD CONSTRAINT fk_mensagens_remetente FOREIGN KEY ("remetenteId") REFERENCES "usuarios"("id");
      ALTER TABLE "mensagens" ADD CONSTRAINT fk_mensagens_destinatario FOREIGN KEY ("destinatarioId") REFERENCES "usuarios"("id");
      ALTER TABLE "pagamentos" ADD CONSTRAINT fk_pagamentos_proposta FOREIGN KEY ("propostaId") REFERENCES "propostas"("id");
    `);

    client.release();
    res.json({ status: 'Tabelas Recriadas com sucesso!' });
  } catch (err) {
    res.json({ erro: err.message });
  }
});

// Endpoint para ver colunas
app.get('/api/cols', async (req, res) => {
  try {
    const { pool } = require('./database');
    const client = await pool.connect();
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'servicos'
      ORDER BY ordinal_position
    `);
    client.release();
    res.json({ colunas: result.rows });
  } catch (err) {
    res.json({ erro: err.message });
  }
});

// Para Vercel
module.exports = app;

// Para local
if (process.env.VERCEL !== 'true') {
  const PORT = process.env.PORT || 3001;
  const HOST = process.env.HOST || '0.0.0.0';
  app.listen(PORT, HOST, () => {
    console.log(`Servidor rodando em http://${HOST}:${PORT}`);
  });
}