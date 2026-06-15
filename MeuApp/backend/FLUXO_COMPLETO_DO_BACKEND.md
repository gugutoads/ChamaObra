# Fluxo Completo do Backend - ChamaObra

Este documento explica detalhadamente como o backend funciona, desde onde ele inicia até onde termina.

---

## 1. Onde tudo começa: server.js

O arquivo `server.js` é o **ponto de entrada** do backend. É ele que inicia o servidor.

```javascript
// server.js (linhas 1-21)
const express = require('express');
const cors = require('cors');

// Importar banco para iniciar conexão
require('./database');  // ← Aqui! Primeiro a conexão com o banco

const app = express();

// Configuração do CORS (permite requisições de outros domínios)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Permite receber JSON nas requisições
app.use(express.json());

// ← Aqui começa o roteamento da API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/servicos', require('./routes/servicoRoutes'));
app.use('/api/propostas', require('./routes/propostaRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/pagamentos', require('./routes/pagamentoRoutes'));
```

**O que acontece nesta etapa:**

| Linha | O que faz |
|-------|-----------|
| `require('./database')` | Conecta ao banco de dados (execute o código de conexão) |
| `app.use(cors(...))` | Configura segurança para aceitar requisições de qualquer domínio |
| `app.use(express.json())` | Permite que o servidor entenda dados JSON no corpo das requisições |
| `app.use('/api/auth', ...)` | Redireiona requisições `/api/auth/*` para `authRoutes.js` |

---

## 2. Conexão com o Banco: database/index.js

Quando `require('./database')` é executado, este arquivo roda:

```javascript
// database/index.js
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');

// Cria um pool de conexões (até 10 conexões simultâneas)
const pool = new Pool({
  host: process.env.DB_HOST,        // "postgres.xxx.supabase.co"
  user: process.env.DB_USER,        // "postgres"
  password: process.env.DB_PASSWORD, // senha do banco
  database: process.env.DB_NAME,    // "postgres"
  port: process.env.DB_PORT || 5432,
  max: 10,                          // máximo de conexões
  ssl: { rejectUnauthorized: false },
});

// Inicializa o Drizzle ORM com o pool de conexões
const db = drizzle(pool);

// Sistema de auto-migração (adiciona colunas se não existirem)
async function migrateDatabase() {
  try {
    await pool.query('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);');
    await pool.query('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS photo TEXT;');
  } catch (err) {
    console.error('ERRO NA MIGRAÇÃO:', err.message);
  }
}

migrateDatabase();

// ← Exporta db e pool para outros arquivos usarem
module.exports = { db, pool };
```

**O que este arquivo faz:**

1. **Cria um pool de conexões** com o PostgreSQL (Supabase)
2. **Inicializa o Drizzle ORM** - uma ferramenta que facilita fazer queries no banco
3. **Executa migrações** - adiciona colunas automaticamente se não existirem
4. **Exporta `db` e `pool`** para que outros arquivos possam usar

**O que é exportado:**

| Variável | Para que serve |
|----------|----------------|
| `db` | Objeto do Drizzle ORM para fazer queries de forma mais simples |
| `pool` | Pool de conexões diretas (para queries SQL puro quando necessário) |

---

## 3. Definição das Tabelas: database/schema.js

Este arquivo **define a estrutura das tabelas** em código JavaScript. É usado pelo Drizzle para saber como trabalhar com os dados.

```javascript
// database/schema.js
const { pgTable, serial, varchar, text, decimal, timestamp, json, boolean, integer, date } = require('drizzle-orm/pg-core');

// Define a tabela 'usuarios'
const usuarios = pgTable('usuarios', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 100 }),
  email: varchar('email', { length: 100 }).notNull(),
  senha: varchar('senha', { length: 255 }).notNull(),
  telefone: varchar('telefone', { length: 20 }),
  cpf: varchar('cpf', { length: 20 }),
  tipo: varchar('tipo', { length: 20 }).notNull(), // 'cliente' ou 'prestador'
  endereco: text('endereco'),
  servico: text('servico'),
  experiencia: text('experiencia'),
  photo: text('photo'),
});

// Define a tabela 'servicos'
const servicos = pgTable('servicos', {
  id: serial('id').primaryKey(),
  clienteId: integer('clienteId').notNull().references(() => usuarios.id),
  titulo: text('titulo'),
  // ...outros campos
});

// ...Define propostas, mensagens, pagamentos

// ← Exporta todas as tabelas definidas
module.exports = {
  usuarios,
  servicos,
  propostas,
  mensagens,
  pagamentos,
};
```

**Nota importante:** Este arquivo **não cria as tabelas no banco**. Ele apenas define a estrutura para o Drizzle poder trabalhar. As tabelas são criadas pelo endpoint `/api/setup` no server.js.

---

## 4. Arquivos de Rotas

Cada arquivo de rota define os **endpoints da API** (URLs que o frontend pode chamar).

### 4.1 authRoutes.js

Gerencia **autenticação e usuários**.

```javascript
// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { db } = require('../database');              // ← Importa db do database
const { usuarios } = require('../database/schema'); // ← Importa schema
const bcrypt = require('bcryptjs');                // ← Para criptografar senhas
const jwt = require('jsonwebtoken');               // ← Para criar tokens
const { eq } = require('drizzle-orm');             // ← Operadores do Drizzle
const auth = require('../middlewares/auth');      // ← Middleware de autenticação

// GET /api/auth/prestadores
// Lista todos os prestadores de serviço
router.get('/prestadores', async (req, res) => {
  const result = await db.select({
    id: usuarios.id,
    nome: usuarios.nome,
    servico: usuarios.servico,
    experiencia: usuarios.experiencia,
    endereco: usuarios.endereco,
  }).from(usuarios).where(eq(usuarios.tipo, 'prestador'));

  res.json(result);  // ← Retorna a lista em JSON
});

// POST /api/auth/register
// Cria um novo usuário
router.post('/register', async (req, res) => {
  const { nome, email, senha, tipo } = req.body;  // ← Pega dados do corpo da requisição

  // Criptografa a senha
  const hash = await bcrypt.hash(senha, 10);

  // Insere no banco usando Drizzle
  await db.insert(usuarios).values({
    nome,
    email,
    senha: hash,
    tipo,
  });

  res.status(201).json({ message: 'Usuário criado com sucesso!' });
});

// POST /api/auth/login
// Faz login e retorna token
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  // Busca usuário pelo email
  const result = await db.select().from(usuarios).where(eq(usuarios.email, email));
  const user = result[0];

  // Verifica senha
  const senhaOk = await bcrypt.compare(senha, user.senha);

  // Cria token JWT
  const token = jwt.sign(
    { id: user.id, tipo: user.tipo },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Retorna token e dados do usuário
  res.json({ token, user: { id: user.id, nome: user.nome, tipo: user.tipo } });
});

// GET /api/auth/me
// Retorna dados do usuário logado (requer autenticação)
router.get('/me', auth, async (req, res) => {
  const user = await db.select().from(usuarios).where(eq(usuarios.id, req.userId));
  res.json({ user: user[0] });
});

// POST /api/auth/update
// Atualiza perfil do usuário (requer autenticação)
router.post('/update', auth, upload.single('photo'), async (req, res) => {
  const { nome, telefone, endereco } = req.body;

  // Atualiza no banco
  const result = await db.update(usuarios)
    .set({ nome, telefone, endereco })
    .where(eq(usuarios.id, req.userId))
    .returning();

  res.json({ message: 'Perfil atualizado com sucesso!' });
});

module.exports = router;  // ← Exporta o router para o server.js usar
```

**Fluxo de uma requisição:**

```
1. Frontend envia POST /api/auth/login com {email, senha}
2. server.js recebe e redireciona para authRoutes.js
3. authRoutes.js processa a requisição
4. Busca no banco usando db.select()
5. Retorna resposta com res.json()
6. Frontend recebe a resposta
```

---

### 4.2 servicoRoutes.js

Gerencia **serviços/pedidos** de reforma.

```javascript
// routes/servicoRoutes.js
const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { servicos, propostas, mensagens, pagamentos } = require('../database/schema');
const authMiddleware = require('../middlewares/auth');

// GET /api/servicos
// Lista todos os serviços
router.get('/', async (req, res) => {
  const result = await db.select().from(servicos);
  res.json(result);
});

// POST /api/servicos
// Cria um novo serviço (requer autenticação)
router.post('/', authMiddleware, upload.array('fotos', 10), async (req, res) => {
  const { titulo, descricao, valor } = req.body;
  const clienteId = req.userId;  // ← Pega ID do usuário do token

  const result = await db.insert(servicos).values({
    clienteId,
    titulo,
    descricao,
    valor,
    status: 'EM_ANDAMENTO',
  });

  res.status(201).json({ id: result.insertId, message: 'Serviço criado!' });
});

// GET /api/servicos/:id
// Busca um serviço específico
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const result = await db.select().from(servicos).where(eq(servicos.id, parseInt(id)));
  res.json(result[0] || null);
});

// DELETE /api/servicos/:id
// Exclui um serviço (com cascade)
router.delete('/:id', authMiddleware, async (req, res) => {
  const servicoId = parseInt(req.params.id);

  // 1. Busca propostas do serviço
  const servicoPropostas = await db.select({ id: propostas.id }).from(propostas).where(eq(propostas.servicoId, servicoId));

  // 2. Deleta pagamentos de cada proposta
  for (const proposta of servicoPropostas) {
    await db.delete(pagamentos).where(eq(pagamentos.propostaId, proposta.id));
  }

  // 3. Deleta mensagens
  await db.delete(mensagens).where(eq(mensagens.servicoId, servicoId));

  // 4. Deleta propostas
  await db.delete(propostas).where(eq(propostas.servicoId, servicoId));

  // 5. Deleta o serviço
  await db.delete(servicos).where(eq(servicos.id, servicoId));

  res.json({ message: 'Serviço excluído!' });
});

// PATCH /api/servicos/:id/status
// Atualiza status do serviço
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  await db.update(servicos).set({ status }).where(eq(servicos.id, parseInt(req.params.id)));
  res.json({ message: 'Status atualizado!' });
});

module.exports = router;
```

---

### 4.3 propostaRoutes.js

Gerencia **propostas** dos prestadores para os serviços.

```javascript
// routes/propostaRoutes.js

// POST /api/propostas
// Cria uma proposta para um serviço
router.post('/', authMiddleware, async (req, res) => {
  const { servicoId, valor, prazo, descricao } = req.body;
  const prestadorId = req.userId;

  const result = await db.insert(propostas).values({
    servicoId: parseInt(servicoId),
    prestadorId,
    valor: String(valor),
    prazo,
    descricao,
    status: 'PENDENTE',
  });

  res.status(201).json({ id: result.insertId, message: 'Proposta enviada!' });
});

// GET /api/propostas/servico/:servicoId
// Lista propostas de um serviço
router.get('/servico/:servicoId', async (req, res) => {
  const result = await db.select().from(propostas)
    .where(eq(propostas.servicoId, parseInt(req.params.servicoId)));
  res.json(result);
});

// PATCH /api/propostas/:id/status
// Atualiza status da proposta
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  await db.update(propostas).set({ status }).where(eq(propostas.id, parseInt(req.params.id)));
  res.json({ message: 'Status atualizado!' });
});

// PATCH /api/propostas/:id/agendamento
// Agenda data para início do serviço
router.patch('/:id/agendamento', authMiddleware, async (req, res) => {
  const { data_agendada, horario_agendado } = req.body;
  await db.update(propostas).set({
    data_agendada: data_agendada ? new Date(data_agendada) : null,
    horario_agendado,
  }).where(eq(propostas.id, parseInt(req.params.id)));
  res.json({ message: 'Agendamento atualizado!' });
});

module.exports = router;
```

---

### 4.4 chatRoutes.js

Gerencia **mensagens/chat** entre usuários.

```javascript
// routes/chatRoutes.js

// POST /api/chat
// Envia uma mensagem
router.post('/', authMiddleware, async (req, res) => {
  const { servicoId, propostaId, destinatarioId, mensagem } = req.body;
  const remetenteId = req.userId;

  const result = await db.insert(mensagens).values({
    servicoId: parseInt(servicoId),
    propostaId: propostaId ? parseInt(propostaId) : null,
    remetenteId,
    destinatarioId: parseInt(destinatarioId),
    mensagem,
  });

  res.status(201).json({ id: result.insertId, message: 'Mensagem enviada!' });
});

// GET /api/chat
// Busca mensagens de um serviço
router.get('/', authMiddleware, async (req, res) => {
  const { servicoId, propostaId } = req.query;
  const userId = req.userId;

  let query = db.select().from(mensagens);
  if (propostaId) {
    query = query.where(eq(mensagens.servicoId, parseInt(servicoId)))
      .where(eq(mensagens.propostaId, parseInt(propostaId)));
  } else {
    query = query.where(eq(mensagens.servicoId, parseInt(servicoId)));
  }

  const rows = await query.orderBy(asc(mensagens.createdAt));
  res.json(rows);
});

// GET /api/chat/conversas
// Lista todas as conversas do usuário
router.get('/conversas', authMiddleware, async (req, res) => {
  const userId = req.userId;

  // Usa SQL puro para buscar conversas
  const result = await pool.query(`
    SELECT DISTINCT
      m."servicoId",
      m."propostaId",
      s.titulo as servicoTitulo,
      u.nome as outroUsuarioNome
    FROM "mensagens" m
    LEFT JOIN "servicos" s ON m."servicoId" = s.id
    LEFT JOIN "usuarios" u ON u.id = ...
    WHERE m."remetenteId" = $1 OR m."destinatarioId" = $1
    ORDER BY ultimaMensagemData DESC
  `, [userId]);

  res.json(result.rows);
});

module.exports = router;
```

---

### 4.5 pagamentoRoutes.js

Gerencia **pagamentos** das propostas.

```javascript
// routes/pagamentoRoutes.js

// POST /api/pagamentos
// Cria um pagamento
router.post('/', authMiddleware, async (req, res) => {
  const { propostaId, valor, status, metodo_pagamento } = req.body;

  // 1. Cria o pagamento
  const result = await db.insert(pagamentos).values({
    propostaId: parseInt(propostaId),
    valor: String(valor),
    status: status || 'PAGO',
    metodo_pagamento: metodo_pagamento || 'ESCROW',
    data_pagamento: new Date(),
  });

  // 2. Atualiza status da proposta
  await db.update(propostas)
    .set({ status: 'AGUARDANDO_INICIO' })
    .where(eq(propostas.id, parseInt(propostaId)));

  res.status(201).json({ id: result.insertId, message: 'Pagamento realizado!' });
});

// GET /api/pagamentos/proposta/:propostaId
// Busca pagamento de uma proposta
router.get('/proposta/:propostaId', async (req, res) => {
  const result = await db.select().from(pagamentos)
    .where(eq(pagamentos.propostaId, parseInt(req.params.propostaId)))
    .limit(1);
  res.json(result[0] || null);
});

module.exports = router;
```

---

## 5. Middlewares

### 5.1 auth.js (Autenticação)

Este middleware **verifica se o usuário está logado** antes de permitir acesso a rotas protegidas.

```javascript
// middlewares/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Pega o token do header
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não enviado' });

  // 2. Extrai o token (formato: "Bearer TOKEN")
  const token = authHeader.split(' ')[1];

  // 3. Verifica se o token é válido
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Adiciona informações do usuário na requisição
    req.userId = decoded.id;
    req.userTipo = decoded.tipo;

    // 5. Continua para a rota
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};
```

**Como funciona:**

```
1. Usuário faz requisição com token no header
2. auth.js intercepta a requisição ANTES da rota
3. Verifica se o token é válido
4. Se válido: adiciona req.userId e req.userTipo e chama next()
5. Se inválido: retorna erro 401
6. A rota só é executada se next() foi chamado
```

---

### 5.2 uploadMiddleware.js (Upload de arquivos)

Este middleware **processa arquivos** enviados pelo frontend (imagens).

```javascript
// middlewares/uploadMiddleware.js
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Armazena arquivos na memória (não no disco)
const storage = multer.memoryStorage();

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: fileFilter
});

module.exports = { upload };
```

---

## 6. Controladores

### 6.1 imagemController.js

Faz o **upload de imagens** para o Supabase Storage.

```javascript
// controllers/imagemController.js
const { supabase } = require('../config/supabase');
const crypto = require('crypto');

// Faz upload de imagens para o Supabase Storage
const uploadImages = async (files) => {
  const uploadedUrls = [];

  for (const file of files) {
    // Gera nome único para o arquivo
    const uniqueId = crypto.randomBytes(12).toString('hex');
    const fileName = `${uniqueId}_${Date.now()}`;
    const fileExt = file.originalname.split('.').pop();
    const filePath = `servicos/${fileName}.${fileExt}`;

    // Upload para Supabase Storage
    const { data, error } = await supabase.storage
      .from('servicos')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    // Pega URL pública
    const { data: publicUrl } = supabase.storage
      .from('servicos')
      .getPublicUrl(filePath);

    uploadedUrls.push(publicUrl.publicUrl);
  }

  return uploadedUrls;
};

module.exports = { uploadImages, deleteImage };
```

---

## 7. Resumo do Fluxo Completo

### Fluxo de uma requisição:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                        │
│  fetch('https://seusite.com/api/auth/login', {                         │
│    method: 'POST',                                                      │
│    body: JSON.stringify({ email: 'x@x.com', senha: '123' })            │
│  })                                                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP POST (JSON)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       SERVER.JS (Entrada)                               │
│                                                                         │
│  1. require('./database')  →  conecta ao banco                         │
│  2. app.use(express.json()) →  permite JSON no corpo                  │
│  3. app.use('/api/auth', require('./routes/authRoutes'))              │
│                              ↓                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                        Redireciona para authRoutes.js
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    AUTHROUTES.JS (Rotas de Auth)                        │
│                                                                         │
│  router.post('/login', async (req, res) => {                          │
│    const { email, senha } = req.body;  ← recebe dados                 │
│                                                                         │
│    const result = await db.select()...  ← consulta banco (Drizzle)    │
│    const user = result[0];                                             │
│                                                                         │
│    const token = jwt.sign(...)  ← cria token JWT                       │
│                                                                         │
│    res.json({ token, user })  ← retorna resposta                       │
│  })                                                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                        Query no banco via Drizzle
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    DATABASE/INDEX.JS                                    │
│                                                                         │
│  const pool = new Pool({ ... });  ← conexão PostgreSQL                 │
│  const db = drizzle(pool);        ← Drizzle ORM                         │
│                                                                         │
│  db.select() → executa SQL no Supabase                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ TCP/IP + SSL
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                         │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │  PostgreSQL (banco de dados)                                │       │
│  │  - Tabela usuarios                                          │       │
│  │  - Tabela servicos                                          │       │
│  │  - Tabela propostas                                         │       │
│  │  - Tabela mensagens                                         │       │
│  │  - Tabela pagamentos                                        │       │
│  └─────────────────────────────────────────────────────────────┘       │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │  Storage (imagens)                                         │       │
│  │  - Bucket 'servicos'                                       │       │
│  └─────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP Response (JSON)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                         │
│  { token: 'eyJhbGci...', user: { id: 1, nome: 'João' } }              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Tabela de Endpoints da API

| Método | URL | Descrição | Autenticado |
|--------|-----|-----------|-------------|
| **Auth** | | | |
| POST | `/api/auth/register` | Criar conta | ❌ |
| POST | `/api/auth/login` | Fazer login | ❌ |
| GET | `/api/auth/me` | Dados do usuário | ✅ |
| POST | `/api/auth/update` | Atualizar perfil | ✅ |
| GET | `/api/auth/prestadores` | Lista prestadores | ❌ |
| **Serviços** | | | |
| GET | `/api/servicos` | Lista serviços | ❌ |
| GET | `/api/servicos/:id` | Detalhes serviço | ✅ |
| POST | `/api/servicos` | Criar serviço | ✅ |
| DELETE | `/api/servicos/:id` | Excluir serviço | ✅ |
| PATCH | `/api/servicos/:id/status` | Atualizar status | ✅ |
| **Propostas** | | | |
| GET | `/api/propostas/servico/:id` | Lista propostas | ❌ |
| POST | `/api/propostas` | Enviar proposta | ✅ |
| PATCH | `/api/propostas/:id/status` | Atualizar status | ✅ |
| **Chat** | | | |
| GET | `/api/chat` | Buscar mensagens | ✅ |
| POST | `/api/chat` | Enviar mensagem | ✅ |
| GET | `/api/chat/conversas` | Lista conversas | ✅ |
| **Pagamentos** | | | |
| GET | `/api/pagamentos/proposta/:id` | Ver pagamento | ❌ |
| POST | `/api/pagamentos` | Criar pagamento | ✅ |

---

## 9. Estrutura de Arquivos e Suas Dependências

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              server.js                                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Entry point                                                       │  │
│  │ - Importa database (executa conexão)                              │  │
│  │ - Configura CORS                                                  │  │
│  │ - Configura JSON parser                                           │  │
│  │ - Mapeia rotas (/api/auth → authRoutes, etc)                     │  │
│  │ - Exporta app para Vercel                                        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
         │                      │                    │              │
         │                      │                    │              │
         ▼                      ▼                    ▼              ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌───────────┐
│  database/      │  │  routes/        │  │  middlewares/   │  │  config/  │
│  index.js       │  │  authRoutes.js  │  │  auth.js        │  │  supabase │
│  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │  │  .js      │
│  │ Conecta   │  │  │  │ Autentica │  │  │  │ Verifica  │  │  │           │
│  │ ao banco  │  │  │  │ usuários  │  │  │  │ token    │  │  │ (opcional)│
│  │           │  │  │  │           │  │  │  │          │  │  │           │
│  │ Exporta:  │  │  │  │ Exporta:  │  │  │  │ Exporta: │  │  │ Exporta:  │
│  │ db, pool  │  │  │  │ router    │  │  │  │ function │  │  │ supabase  │
│  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │  │  client   │
│        │       │  │        │        │  │        │         │  └───────────┘
│        ▼       │  │        ▼        │  │        ▼         │
│  schema.js     │  │        ▼        │  │  uploadMiddleware│
│  ┌───────────┐│  │ middlewares/   │  │  ┌───────────┐   │
│  │ Define    ││  │  auth.js        │  │  │ Processa  │   │
│  │ tabelas   ││  │                 │  │  │ arquivos  │   │
│  │           ││  │                 │  │  │           │   │
│  │ Exporta:  ││  │                 │  │  │ Exporta:  │   │
│  │ usuarios, ││  │                 │  │  │ upload    │   │
│  │ servicos  ││  │                 │  │  └───────────┘   │
│  │ etc       ││  │                 │  │        │         │
│  └───────────┘│  │                 │  │        ▼         │
└─────────────────┘  │                 │  │  controllers/   │
                     └─────────────────┘  │  imagemController
                                             │  ┌───────────┐  │
                                             │  │ Upload    │  │
                                             │  │ para      │  │
                                             │  │ Supabase  │  │
                                             │  │ Storage   │  │
                                             │  └───────────┘  │
                                             └─────────────────┘
```

---

## 10. Resumo: O que cada arquivo faz

| Arquivo | Função | O que exporta |
|---------|-------|---------------|
| **server.js** | Inicia o servidor e roteia requisições | `app` |
| **database/index.js** | Conecta ao Supabase e cria o Drizzle | `{ db, pool }` |
| **database/schema.js** | Define estrutura das tabelas | `{ usuarios, servicos, propostas, mensagens, pagamentos }` |
| **routes/authRoutes.js** | Endpoints de autenticação | `router` |
| **routes/servicoRoutes.js** | Endpoints de serviços | `router` |
| **routes/propostaRoutes.js** | Endpoints de propostas | `router` |
| **routes/chatRoutes.js** | Endpoints de mensagens | `router` |
| **routes/pagamentoRoutes.js** | Endpoints de pagamentos | `router` |
| **middlewares/auth.js** | Verifica token JWT | Função middleware |
| **middlewares/uploadMiddleware.js** | Processa upload de imagens | `{ upload }` |
| **controllers/imagemController.js** | Envia imagens para Supabase Storage | `{ uploadImages, deleteImage }` |
| **config/supabase.js** | Cliente do Supabase (Storage) | `{ supabase }` |

---

## Conclusão

O backend do ChamaObra segue uma arquitetura simples mas eficiente:

1. **server.js** é o ponto de entrada
2. **database/index.js** faz a conexão com o Supabase
3. **routes/*.js** definem os endpoints da API
4. **middlewares/auth.js** protege rotas que precisam de login
5. **controllers/** ajudam com tarefas específicas (upload de imagens)

O fluxo é sempre: **Requisição → Server → Rota → Banco de Dados → Resposta**