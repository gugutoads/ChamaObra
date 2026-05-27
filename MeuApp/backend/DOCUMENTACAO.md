# Documentação Técnica do Backend - ChamaObra

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                  APP (Frontend)                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│  │  Telas do   │    │  axios API  │    │ SecureStore │                │
│  │  Expo/React │    │  (fetch)    │    │ (token JWT) │                │
│  └──────┬──────┘    └──────┬──────┘    └─────────────┘                │
└─────────┼──────────────────┼───────────────────────────────────────────┘
          │                  │
          │    http://192.168.1.10:3000/api/...
          │
┌─────────┴───────────────────────────────────────────────────────────────┐
│                           SERVIDOR (Backend)                            │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        server.js                                │   │
│  │  ┌─────────┐  ┌──────────┐  ┌────────────┐                    │   │
│  │  │ Express │  │   CORS   │  │  Rotas do  │                    │   │
│  │  │ (app)   │  │ (permitir│  │    API     │                    │   │
│  │  │         │  │  acesso)│  │            │                    │   │
│  │  └────┬────┘  └──────────┘  └─────┬──────┘                    │   │
│  └───────┼────────────────────────────┼────────────────────────────┘   │
│          │                            │                                 │
│  ┌───────┴────────────────────────────┴───────────────────────────┐   │
│  │                        ROTAS (routes/)                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │   │
│  │  │ authRoutes   │  │ servicoRoutes│  │propostaRoutes│          │   │
│  │  │   .js        │  │    .js       │  │    .js       │          │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │   │
│  └─────────┼─────────────────┼─────────────────┼──────────────────┘   │
│            │                 │                 │                    │
│  ┌─────────┴─────────────────┴─────────────────┴──────────────────┐ │
│  │              CONTROLLERS / MIDDLEWARES                          │ │
│  │  ┌─────────────────┐  ┌─────────────────┐                      │ │
│  │  │ authController  │  │     auth.js     │  (middleware)         │ │
│  │  │  (lógica de    │  │  (verifica JWT)  │                      │ │
│  │  │   auth)        │  │                 │                      │ │
│  │  └────────┬────────┘  └────────┬────────┘                      │ │
│  └───────────┼───────────────────┼────────────────────────────────┘ │
│              │                   │                                    │
│  ┌───────────┴───────────────────┴────────────────────────────────┐ │
│  │                    DATABASE (database.js)                       │ │
│  │         ┌──────────────────────────────────────┐              │ │
│  │         │         Pool de Conexões MySQL        │              │ │
│  │         │     (mysql2/promise)                  │              │ │
│  │         └──────────────────────────────────────┘              │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
┌───────────────────────────────────┴───────────────────────────────────┐
│                          MYSQL (Banco de Dados)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │  usuarios   │  │  servicos   │  │  propostas  │                  │
│  │  (tabela)   │  │  (tabela)   │  │  (tabela)   │                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 1. Arquivo .env (Configurações)

O arquivo `.env` guarda todas as configurações sensíveis do sistema:

```env
DB_HOST=localhost          # Onde o MySQL está instalado
DB_USER=root               # Usuário do banco
DB_PASSWORD=Astronomia12!  # Senha do banco
DB_NAME=chamaobrá          # Nome do banco de dados
DB_PORT=3306              # Porta padrão do MySQL
JWT_SECRET=kauy            # Chave secreta para criar tokens JWT
PORT=3000                 # Porta onde o servidor vai rodar
HOST=0.0.0.0              # IP do servidor (0.0.0.0 = qualquer interface)
```

**Por que usar .env?**
- Não exposing senhas no código
- Facilita mudança de configurações
- Cada ambiente pode ter suas próprias configurações

---

## 2. server.js (Servidor Principal)

```javascript
const express = require('express');      // Framework web
const cors = require('cors');            // Lib para permitir acesso de outros domains
require('dotenv').config();              // Carrega variáveis do .env

const app = express();

// MIDDLEWARE - Funções que executam ANTES das rotas
app.use(cors({                          // Permite qualquer site/app acessar a API
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());                 // Permite receber JSON no corpo das requisições

// ROTAS - Define os "endereços" da API
app.use('/api/auth', require('./routes/authRoutes'));      // Login, registro
app.use('/api/servicos', require('./routes/servicoRoutes')); // CRUD de serviços
app.use('/api/propostas', require('./routes/propostaRoutes')); // CRUD de propostas
app.use('/api/usuarios', require('./routes/authRoutes'));    // same as auth

// INICIAR SERVIDOR
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});
```

**O que cada parte faz:**

| Parte | Função |
|-------|--------|
| `express` | Cria o servidor web |
| `cors` | Permite que o app mobile possa acessar a API |
| `express.json()` | Transforma JSON da requisição em objeto JavaScript |
| `app.use('/api/...')` | Define os caminhos da API |
| `app.listen()` | Coloca o servidor para rodar |

---

## 3. database.js (Conexão com MySQL)

```javascript
const mysql = require('mysql2/promise');  // Driver do MySQL para Node.js
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,        // localhost
  user: process.env.DB_USER,       // root
  password: process.env.DB_PASSWORD, // Astronomia12!
  database: process.env.DB_NAME,   // chamaobrá
  port: process.env.DB_PORT,       // 3306
  waitForConnections: true,        // Espera se não houver conexão livre
  connectionLimit: 10,             // Máximo de conexões simultâneas
});

module.exports = pool;
```

**O que é um Pool de Conexões?**

Imagine que você tem um banco de dados e 100 pessoas querem usar ao mesmo tempo. Abrir e fechar conexão para cada pessoa é lento.

O **pool** cria 10 conexões de uma vez e as reutiliza:
- Requisição 1 → usa conexão 1
- Requisição 2 → usa conexão 2
- Requisição 3 → usa conexão 3
- Requisição 4 → usa conexão 1 (já liberou)
- ...e assim por diante

Isso é muito mais rápido!

---

## 4. Rotas (routes/)

As rotas são como **endereços** da API. Cada rota representa uma ação.

### 4.1 authRoutes.js

```javascript
const express = require('express');
const router = express.Router();        // Cria um "mini app" para rotas
const db = require('../database/database'); // Conexão com banco
const bcrypt = require('bcryptjs');      // Para criptografar senhas
const jwt = require('jsonwebtoken');     // Para criar tokens de login
require('dotenv').config();

// ┌─────────────────────────────────────────────────────────────┐
// │  GET /api/auth/prestadores                                 │
// │  Lista todos os prestadores de serviço                    │
// └─────────────────────────────────────────────────────────────┘
router.get('/prestadores', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, nome, servico, experiencia, endereco FROM usuarios WHERE tipo = 'prestador'`
    );
    res.json(rows);  // Retorna como JSON
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar prestadores' });
  }
});

// ┌─────────────────────────────────────────────────────────────┐
// │  POST /api/auth/register                                   │
// │  Cadastra um novo usuário                                  │
// └─────────────────────────────────────────────────────────────┘
router.post('/register', async (req, res) => {
  // req.body = dados que o app enviou
  const { nome, email, senha, cpf, tipo, endereco, servico, experiencia } = req.body;

  try {
    // Criptografa a senha antes de salvar (segurança!)
    const hash = await bcrypt.hash(senha, 10);

    // Insere no banco
    await db.query(
      `INSERT INTO usuarios (nome, email, senha, cpf, tipo, endereco, servico, experiencia)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, email, hash, cpf ?? null, tipo, endereco ?? null, servico ?? null, experiencia ?? null]
    );

    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ┌─────────────────────────────────────────────────────────────┐
// │  POST /api/auth/login                                      │
// │  Faz login e retorna token JWT                             │
// └─────────────────────────────────────────────────────────────┘
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Busca usuário pelo email
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?', [email]
    );

    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Email não cadastrado' });

    // Verifica se a senha está correta
    const senhaOk = await bcrypt.compare(senha, user.senha);
    if (!senhaOk) return res.status(401).json({ error: 'Senha incorreta' });

    // Cria token JWT (pra manter o usuário logado)
    const token = jwt.sign(
      { id: user.id, tipo: user.tipo },  // Dados que vão dentro do token
      process.env.JWT_SECRET,             // Chave secreta
      { expiresIn: '7d' }                  // Token expira em 7 dias
    );

    // Retorna token e dados do usuário
    res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        endereco: user.endereco,
        servico: user.servico,
        experiencia: user.experiencia,
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
```

### 4.2 servicoRoutes.js

```javascript
const express = require('express');
const router = express.Router();
const db = require('../database/database');
const authMiddleware = require('../middlewares/auth');

// ┌─────────────────────────────────────────────────────────────┐
// │  POST /api/servicos                                        │
// │  Cria um novo serviço                                      │
// │  Usa authMiddleware - só usuário logado pode criar         │
// └─────────────────────────────────────────────────────────────┘
router.post('/', authMiddleware, async (req, res) => {
  const { titulo, descricao, metragem, categoria, urgencia, materiais, endereco, valor } = req.body;
  const clienteId = req.userId;  // Vem do middleware (decodificado do token)

  try {
    const [result] = await db.query(
      `INSERT INTO servicos (clienteId, titulo, descricao, metragem, categoria, urgencia, materiais, endereco, status, valor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'EM_ANDAMENTO', ?)`,
      [clienteId, titulo, descricao, metragem, categoria, urgencia, materiais, endereco, valor ?? null]
    );
    res.status(201).json({ id: result.insertId, message: 'Serviço criado!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
});

// ┌─────────────────────────────────────────────────────────────┐
// │  GET /api/servicos/cliente/:clienteId                     │
// │  Lista serviços de um cliente específico                   │
// └─────────────────────────────────────────────────────────────┘
router.get('/cliente/:clienteId', authMiddleware, async (req, res) => {
  const { clienteId } = req.params;
  const { status } = req.query;  // Ex: ?status=EM_ANDAMENTO

  try {
    let query = 'SELECT * FROM servicos WHERE clienteId = ?';
    const params = [clienteId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY criado_em DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

// ┌─────────────────────────────────────────────────────────────┐
// │  GET /api/servicos/:id                                     │
// │  Detalhes de um serviço específico                         │
// └─────────────────────────────────────────────────────────────┘
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM servicos WHERE id = ?', [id]);
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar serviço' });
  }
});

// ┌─────────────────────────────────────────────────────────────┐
// │  PATCH /api/servicos/:id/status                           │
// │  Atualiza o status de um serviço                           │
// └─────────────────────────────────────────────────────────────┘
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.query('UPDATE servicos SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status atualizado!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

module.exports = router;
```

---

## 5. Middlewares (auth.js)

Middlewares são **funções que executam antes das rotas**. São usados para:

- Verificar se o usuário está logado
- Validar dados
- Logar requisições
- etc.

```javascript
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ┌─────────────────────────────────────────────────────────────┐
// │  authMiddleware                                            │
// │  Verifica se o token JWT é válido                         │
// │  Se válido, adiciona o userId ao objeto req               │
// └─────────────────────────────────────────────────────────────┘
module.exports = async (req, res, next) => {
  // Pega o token do cabeçalho da requisição
  const authHeader = req.headers.authorization;

  // Se não tem token, retorna erro
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  // O formato é "Bearer <token>", pega só o token
  const token = authHeader.split(' ')[1];

  try {
    // Verifica se o token é válido (não foi falsificado)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Se tudo ok, adiciona o ID do usuário à requisição
    req.userId = decoded.id;
    req.userTipo = decoded.tipo;

    // Continua para a rota
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
```

**Por que isso é importante?**

Quando você faz login, recebe um token. Em cada requisição subsequente, o app envia esse token. O middleware verifica:
- O token é real? (não foi criado por alguém malicioso)
- Não expirou?
- pertence a um usuário válido?

Se tudo estiver certo, a requisição continua para a rota. Se não, retorna erro 401.

---

## 6. Fluxo Completo de uma Requisição

### Exemplo: Fazer Login

```
┌─────────────────────────────────────────────────────────────────────────┐
│ APP MOBILE                                                             │
│                                                                         │
│ 1. Usuário preenche email e senha                                      │
│ 2. App chama: axios.post('http://192.168.1.10:3000/api/auth/login', {  │
│                   email: 'teste@email.com',                           │
│                   senha: 'minhasenha'                                  │
│                 })                                                      │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             │ HTTP POST /api/auth/login
                             │ {"email": "teste@email.com", "senha": "minhasenha"}
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ SERVIDOR                                                                │
│                                                                         │
│ 3. Express recebe a requisição                                         │
│ 4. CORS permite o acesso (cors middleware)                              │
│ 5. express.json() transforma o JSON em objeto JavaScript               │
│                                                                         │
│ 6. Rota /api/auth/login é acionada                                     │
│                                                                         │
│ 7. authRoutes.js - login:                                             │
│    - Busca no banco: SELECT * FROM usuarios WHERE email = ?            │
│    - bcrypt.compare() verifica a senha                                  │
│    - jwt.sign() cria o token                                            │
│                                                                         │
│ 8. Retorna resposta:                                                    │
│    { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",                 │
│      user: { id: 1, nome: "João", ... } }                              │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             │ HTTP 200 OK
                             │ {"token": "...", "user": {...}}
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ APP MOBILE                                                             │
│                                                                         │
│ 9. App recebe o token                                                  │
│ 10. Salva no SecureStore: await SecureStore.setItemAsync('token', ...) │
│ 11. Redireciona para tela principal                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Exemplo: Criar um Serviço (com autenticação)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ APP MOBILE                                                             │
│                                                                         │
│ 1. Usuário preenche formulário de serviço                              │
│ 2. App pega o token do SecureStore                                     │
│ 3. App faz a requisição com o token:                                   │
│                                                                         │
│    axios.post('http://192.168.1.10:3000/api/servicos',                │
│      { titulo: "Trocar piso", ... },                                   │
│      { headers: { Authorization: 'Bearer eyJ...' } }                 │
│    )                                                                   │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             │ HTTP POST /api/servicos
                             │ Authorization: Bearer eyJ...
                             │ {"titulo": "Trocar piso", ...}
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ SERVIDOR                                                                │
│                                                                         │
│ 4. Express recebe a requisição                                         │
│ 5. authMiddleware (ROTAS USA authMiddleware):                          │
│    - Pega o token do header                                            │
│    - jwt.verify() verifica se é válido                                  │
│    - Define req.userId = decoded.id                                     │
│    - chama next()                                                       │
│                                                                         │
│ 6. servicoRoutes.js - POST /:                                         │
│    - Pega o userId do req                                              │
│    - Executa: INSERT INTO servicos (clienteId, titulo, ...)            │
│    - Define status = 'EM_ANDAMENTO'                                     │
│                                                                         │
│ 7. Retorna: { id: 1, message: 'Serviço criado!' }                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Tabelas do Banco de Dados

### Tabela: usuarios

```sql
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,           -- Nome completo
  email VARCHAR(255) UNIQUE NOT NULL,   -- Email (único!)
  senha VARCHAR(255) NOT NULL,          -- Senha criptografada
  cpf VARCHAR(14),                      -- CPF (opcional)
  tipo ENUM('cliente','prestador') NOT NULL,  -- Tipo de usuário
  endereco TEXT,                        -- Endereço
  servico VARCHAR(255),                 -- Serviço que oferece (se prestador)
  experiencia TEXT,                     -- Experiência profissional
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: servicos

```sql
CREATE TABLE servicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clienteId INT NOT NULL,              -- FK para usuarios.id
  titulo VARCHAR(255) NOT NULL,        -- Título do serviço
  descricao TEXT,                      -- Descrição detalhada
  metragem VARCHAR(50),                -- Metragem (ex: "50m²")
  categoria VARCHAR(100),              -- Categoria (ex: "reforma")
  urgencia VARCHAR(50),                -- Urgência (ex: "urgente")
  materiais TEXT,                     -- Materiais necessários
  endereco TEXT,                       -- Endereço do serviço
  status VARCHAR(50) DEFAULT 'EM_ANDAMENTO',  -- Status do serviço
  valor DECIMAL(10,2),                 -- Orçamento
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clienteId) REFERENCES usuarios(id)
);
```

### Tabela: propostas

```sql
CREATE TABLE propostas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  servicoId INT NOT NULL,              -- FK para servicos.id
  prestadorId INT NOT NULL,            -- FK para usuarios.id
  valor DECIMAL(10,2) NOT NULL,       -- Valor proposto
  prazo VARCHAR(50),                   -- Prazo de entrega
  descricao TEXT,                      -- Descrição da proposta
  status VARCHAR(50) DEFAULT 'pendente',  -- Status
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (servicoId) REFERENCES servicos(id),
  FOREIGN KEY (prestadorId) REFERENCES usuarios(id)
);
```

---

## 8. Comunicação Frontend ↔ Backend

### api.ts (Configuração do axios)

```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: 'http://192.168.1.10:3000/api',  // URL base da API
});

// Interceptador de requisição - adiciona token automaticamente
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**Por que usar interceptador?**

Sem interceptador, você teria que fazer isso em cada requisição:

```typescript
// Sem interceptador - trabalho repetitivo
const token = await SecureStore.getItemAsync('token');
axios.post('/api/servicos', dados, {
  headers: { Authorization: `Bearer ${token}` }
});

// Com interceptador - simples
api.post('/api/servicos', dados);
```

O interceptador **automaticamente** adiciona o token em toda requisição!

---

## 9. Resumo: Métodos HTTP

| Método | Significado | Uso típico |
|--------|-------------|------------|
| `GET` | Buscar/Ler dados | Listar prestadores, buscar serviço |
| `POST` | Criar novo registro | Cadastrar usuário, criar serviço |
| `PUT` | Atualizar registro inteiro | Atualizar perfil (raro) |
| `PATCH` | Atualizar parcialmente | Mudar status, editar campo |
| `DELETE` | Excluir registro | Remover serviço |

---

## 10. Códigos de Status HTTP

| Código | Significado | Quando usar |
|--------|-------------|-------------|
| 200 | OK | Requisição sucedeu |
| 201 | Created | Registro criado com sucesso |
| 400 | Bad Request | Dados inválidos |
| 401 | Unauthorized | Token inválido ou não fornecido |
| 404 | Not Found | Registro não encontrado |
| 500 | Internal Server Error | Erro no servidor |

---

## 11. Iniciar o Projeto

### No seu computador:

```bash
# 1. Entre na pasta do backend
cd MeuApp/backend

# 2. Instale as dependências (se necessário)
npm install

# 3. Inicie o servidor
node server.js
# ou com nodemon (reinicia automaticamente)
npm run dev
```

### No computador de outra pessoa:

```bash
# 1. Clone o projeto
# 2. Entre na pasta do frontend
cd MeuApp

# 3. Atualize o IP no arquivo database/api.ts
# De: baseURL: 'http://192.168.1.10:3000/api'
# Para: o IP do computador que está rodando o servidor

# 4. Inicie o app
npx expo start
```

---

## Conclusão

Essa arquitetura segue o padrão REST API:

1. **Frontend** (Expo/React Native) faz requisições HTTP
2. **Servidor** (Express) recebe e processa
3. **Routes** direciona para a lógica correta
4. **Middleware** verifica autenticação
5. **Database** executa queries no MySQL
6. **Resposta** volta para o frontend

É um padrão muito usado em produção e escalável!