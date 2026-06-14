CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100),
  email VARCHAR(100) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  cpf VARCHAR(20),
  tipo VARCHAR(20) NOT NULL,
  endereco TEXT,
  servico TEXT,
  experiencia TEXT
);

CREATE TABLE IF NOT EXISTS servicos (
  id SERIAL PRIMARY KEY,
  clienteId INTEGER NOT NULL REFERENCES usuarios(id),
  titulo TEXT,
  descricao TEXT,
  metragem VARCHAR(50),
  categoria VARCHAR(100),
  urgencia VARCHAR(50),
  materiais TEXT,
  endereco TEXT,
  status VARCHAR(20) DEFAULT 'EM_ANDAMENTO',
  valor DECIMAL(10, 2),
  fotos JSONB
);

CREATE TABLE IF NOT EXISTS propostas (
  id SERIAL PRIMARY KEY,
  servicoId INTEGER NOT NULL REFERENCES servicos(id),
  prestadorId INTEGER NOT NULL REFERENCES usuarios(id),
  valor DECIMAL(10, 2),
  prazo VARCHAR(255),
  descricao TEXT,
  status VARCHAR(20) DEFAULT 'PENDENTE',
  data_agendada DATE,
  horario_agendado VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS mensagens (
  id SERIAL PRIMARY KEY,
  servicoId INTEGER NOT NULL REFERENCES servicos(id),
  propostaId INTEGER,
  remetenteId INTEGER NOT NULL REFERENCES usuarios(id),
  destinatarioId INTEGER NOT NULL REFERENCES usuarios(id),
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pagamentos (
  id SERIAL PRIMARY KEY,
  propostaId INTEGER NOT NULL REFERENCES propostas(id),
  valor DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDENTE',
  metodo_pagamento VARCHAR(50) DEFAULT 'ESCROW',
  data_pagamento TIMESTAMP
);