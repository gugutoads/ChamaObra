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
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/servicos', require('./routes/servicoRoutes'));
app.use('/api/propostas', require('./routes/propostaRoutes'));
app.use('/api/usuarios', require('./routes/authRoutes'));
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

    // Criar tabelas
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100),
        email VARCHAR(100) NOT NULL,
        senha VARCHAR(255) NOT NULL,
        cpf VARCHAR(20),
        tipo VARCHAR(20) NOT NULL,
        endereco TEXT,
        servico TEXT,
        experiencia TEXT
      );

      CREATE TABLE IF NOT EXISTS servicos (
        id SERIAL PRIMARY KEY,
        "clienteId" INTEGER NOT NULL REFERENCES usuarios(id),
        titulo TEXT,
        descricao TEXT,
        metragem VARCHAR(50),
        categoria VARCHAR(100),
        urgencia VARCHAR(50),
        materiais TEXT,
        endereco TEXT,
        status VARCHAR(20) DEFAULT 'EM_ANDAMENTO',
        valor DECIMAL(10, 2),
        fotos JSONB,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS propostas (
        id SERIAL PRIMARY KEY,
        "servicoId" INTEGER NOT NULL REFERENCES servicos(id),
        "prestadorId" INTEGER NOT NULL REFERENCES usuarios(id),
        valor DECIMAL(10, 2),
        prazo VARCHAR(255),
        descricao TEXT,
        status VARCHAR(20) DEFAULT 'PENDENTE',
        "data_agendada" DATE,
        "horario_agendado" VARCHAR(255),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS mensagens (
        id SERIAL PRIMARY KEY,
        "servicoId" INTEGER NOT NULL REFERENCES servicos(id),
        "propostaId" INTEGER,
        "remetenteId" INTEGER NOT NULL REFERENCES usuarios(id),
        "destinatarioId" INTEGER NOT NULL REFERENCES usuarios(id),
        mensagem TEXT NOT NULL,
        lida BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS pagamentos (
        id SERIAL PRIMARY KEY,
        "propostaId" INTEGER NOT NULL REFERENCES propostas(id),
        valor DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDENTE',
        metodo_pagamento VARCHAR(50) DEFAULT 'ESCROW',
        data_pagamento TIMESTAMP,
        data_criacao TIMESTAMP DEFAULT NOW()
      );
    `);

    client.release();
    res.json({ status: 'Tabelas criadas com sucesso!' });
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