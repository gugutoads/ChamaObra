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

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});