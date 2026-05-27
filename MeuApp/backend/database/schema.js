const { pgTable, serial, varchar, text, decimal, timestamp, json, boolean, integer, date } = require('drizzle-orm/pg-core');

const usuarios = pgTable('usuarios', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 100 }),
  email: varchar('email', { length: 100 }).notNull(),
  senha: varchar('senha', { length: 255 }).notNull(),
  cpf: varchar('cpf', { length: 20 }),
  tipo: varchar('tipo', { length: 20 }).notNull(), // 'contratante' ou 'prestador'
  endereco: text('endereco'),
  servico: text('servico'),
  experiencia: text('experiencia'),
});

const servicos = pgTable('servicos', {
  id: serial('id').primaryKey(),
  clienteId: integer('clienteId').notNull().references(() => usuarios.id),
  titulo: text('titulo'),
  descricao: text('descricao'),
  metragem: varchar('metragem', { length: 50 }),
  categoria: varchar('categoria', { length: 100 }),
  urgencia: varchar('urgencia', { length: 50 }),
  materiais: text('materiais'),
  endereco: text('endereco'),
  status: varchar('status', { length: 20 }).default('EM_ANDAMENTO'), // 'EM_ANDAMENTO' ou 'CONCLUIDO'
  valor: decimal('valor', { precision: 10, scale: 2 }),
  fotos: json('fotos'),
});

const propostas = pgTable('propostas', {
  id: serial('id').primaryKey(),
  servicoId: integer('servicoId').notNull().references(() => servicos.id),
  prestadorId: integer('prestadorId').notNull().references(() => usuarios.id),
  valor: decimal('valor', { precision: 10, scale: 2 }),
  prazo: varchar('prazo', { length: 255 }),
  descricao: text('descricao'),
  status: varchar('status', { length: 20 }).default('PENDENTE'), // 'PENDENTE', 'ACEITA', 'RECUSADA', 'AGUARDANDO_INICIO'
  data_agendada: date('data_agendada'),
  horario_agendado: varchar('horario_agendado', { length: 255 }),
});

const mensagens = pgTable('mensagens', {
  id: serial('id').primaryKey(),
  servicoId: integer('servicoId').notNull().references(() => servicos.id),
  propostaId: integer('propostaId'),
  remetenteId: integer('remetenteId').notNull().references(() => usuarios.id),
  destinatarioId: integer('destinatarioId').notNull().references(() => usuarios.id),
  mensagem: text('mensagem').notNull(),
  lida: boolean('lida').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

const pagamentos = pgTable('pagamentos', {
  id: serial('id').primaryKey(),
  propostaId: integer('propostaId').notNull().references(() => propostas.id),
  valor: decimal('valor', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).default('PENDENTE'),
  metodo_pagamento: varchar('metodo_pagamento', { length: 50 }).default('ESCROW'),
  data_pagamento: timestamp('data_pagamento'),
});

module.exports = {
  usuarios,
  servicos,
  propostas,
  mensagens,
  pagamentos,
};