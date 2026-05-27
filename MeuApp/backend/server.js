const express = require('express');
const cors = require('cors');
require('dotenv').config();

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
app.get('/api/test', (req, res) => {
  res.json({
    db_host: process.env.DB_HOST ? 'setado' : 'undefined',
    db_user: process.env.DB_USER ? 'setado' : 'undefined',
    db_name: process.env.DB_NAME ? 'setado' : 'undefined',
    db_port: process.env.DB_PORT,
    node_env: process.env.NODE_ENV,
    vercel: process.env.VERCEL
  });
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