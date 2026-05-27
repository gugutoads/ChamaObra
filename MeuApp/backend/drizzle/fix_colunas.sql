-- Adicionar colunas que existem no schema mas não no banco

-- Usuarios: adicionar criado_em
ALTER TABLE usuarios ADD COLUMN criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Servicos: adicionar fotos e metragem
ALTER TABLE servicos ADD COLUMN fotos JSON;
ALTER TABLE servicos ADD COLUMN metragem VARCHAR(50);

-- Propostas: adicionar data_agendada e horario_agendado
ALTER TABLE propostas ADD COLUMN data_agendada DATE;
ALTER TABLE propostas ADD COLUMN horario_agendado VARCHAR(255);