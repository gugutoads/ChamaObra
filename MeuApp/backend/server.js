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
    await client.query('SELECT 1');
    client.release();
    res.json({ status: 'Banco conectado com sucesso!' });
  } catch (err) {
    res.json({ erro: err.message, codigo: err.code });
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