CREATE TABLE `usuarios` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`nome` varchar(100),
	`email` varchar(100) NOT NULL,
	`senha` varchar(255) NOT NULL,
	`cpf` varchar(20),
	`tipo` enum('contratante','prestador') NOT NULL,
	`endereco` text,
	`servico` text,
	`experiencia` text,
	`criado_em` timestamp DEFAULT (now()),
	CONSTRAINT `usuarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `servicos` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`clienteId` int NOT NULL,
	`titulo` text,
	`descricao` text,
	`metragem` varchar(50),
	`categoria` varchar(100),
	`urgencia` varchar(50),
	`materiais` text,
	`endereco` text,
	`status` enum('EM_ANDAMENTO','CONCLUIDO') DEFAULT 'EM_ANDAMENTO',
	`valor` decimal(10,2),
	`criado_em` timestamp DEFAULT (now()),
	`fotos` json,
	CONSTRAINT `servicos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `propostas` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`servicoId` int NOT NULL,
	`prestadorId` int NOT NULL,
	`valor` decimal(10,2),
	`prazo` varchar(255),
	`descricao` text,
	`status` enum('PENDENTE','ACEITA','RECUSADA','AGUARDANDO_INICIO') DEFAULT 'PENDENTE',
	`criado_em` timestamp DEFAULT (now()),
	`data_agendada` date,
	`horario_agendado` varchar(255),
	CONSTRAINT `propostas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mensagens` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`servicoId` int NOT NULL,
	`propostaId` int,
	`remetenteId` int NOT NULL,
	`destinatarioId` int NOT NULL,
	`mensagem` text NOT NULL,
	`lida` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `mensagens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pagamentos` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`propostaId` int NOT NULL,
	`valor` decimal(10,2) NOT NULL,
	`status` varchar(50) DEFAULT 'PENDENTE',
	`metodo_pagamento` varchar(50) DEFAULT 'ESCROW',
	`data_pagamento` timestamp,
	`data_criacao` timestamp DEFAULT (now()),
	CONSTRAINT `pagamentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `servicos` ADD CONSTRAINT `servicos_clienteId_usuarios_id_fk` FOREIGN KEY (`clienteId`) REFERENCES `usuarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `propostas` ADD CONSTRAINT `propostas_servicoId_servicos_id_fk` FOREIGN KEY (`servicoId`) REFERENCES `servicos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `propostas` ADD CONSTRAINT `propostas_prestadorId_usuarios_id_fk` FOREIGN KEY (`prestadorId`) REFERENCES `usuarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mensagens` ADD CONSTRAINT `mensagens_servicoId_servicos_id_fk` FOREIGN KEY (`servicoId`) REFERENCES `servicos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mensagens` ADD CONSTRAINT `mensagens_remetenteId_usuarios_id_fk` FOREIGN KEY (`remetenteId`) REFERENCES `usuarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mensagens` ADD CONSTRAINT `mensagens_destinatarioId_usuarios_id_fk` FOREIGN KEY (`destinatarioId`) REFERENCES `usuarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_propostaId_propostas_id_fk` FOREIGN KEY (`propostaId`) REFERENCES `propostas`(`id`) ON DELETE no action ON UPDATE no action;