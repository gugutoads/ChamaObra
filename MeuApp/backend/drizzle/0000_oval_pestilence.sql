CREATE TABLE "usuarios" (
	"id" serial PRIMARY KEY,
	"nome" varchar(100),
	"email" varchar(100) NOT NULL,
	"senha" varchar(255) NOT NULL,
	"cpf" varchar(20),
	"tipo" varchar(20) NOT NULL,
	"endereco" text,
	"servico" text,
	"experiencia" text
);
--> statement-breakpoint
CREATE TABLE "servicos" (
	"id" serial PRIMARY KEY,
	"clienteId" integer NOT NULL,
	"titulo" text,
	"descricao" text,
	"metragem" varchar(50),
	"categoria" varchar(100),
	"urgencia" varchar(50),
	"materiais" text,
	"endereco" text,
	"status" varchar(20) DEFAULT 'EM_ANDAMENTO',
	"valor" decimal(10,2),
	"fotos" json,
	CONSTRAINT "servicos_clienteId_usuarios_id_fk" FOREIGN KEY ("clienteId") REFERENCES "usuarios"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE "propostas" (
	"id" serial PRIMARY KEY,
	"servicoId" integer NOT NULL,
	"prestadorId" integer NOT NULL,
	"valor" decimal(10,2),
	"prazo" varchar(255),
	"descricao" text,
	"status" varchar(20) DEFAULT 'PENDENTE',
	"data_agendada" date,
	"horario_agendado" varchar(255),
	CONSTRAINT "propostas_servicoId_servicos_id_fk" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "propostas_prestadorId_usuarios_id_fk" FOREIGN KEY ("prestadorId") REFERENCES "usuarios"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE "mensagens" (
	"id" serial PRIMARY KEY,
	"servicoId" integer NOT NULL,
	"propostaId" integer,
	"remetenteId" integer NOT NULL,
	"destinatarioId" integer NOT NULL,
	"mensagem" text NOT NULL,
	"lida" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "mensagens_servicoId_servicos_id_fk" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "mensagens_remetenteId_usuarios_id_fk" FOREIGN KEY ("remetenteId") REFERENCES "usuarios"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "mensagens_destinatarioId_usuarios_id_fk" FOREIGN KEY ("destinatarioId") REFERENCES "usuarios"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE "pagamentos" (
	"id" serial PRIMARY KEY,
	"propostaId" integer NOT NULL,
	"valor" decimal(10,2) NOT NULL,
	"status" varchar(50) DEFAULT 'PENDENTE',
	"metodo_pagamento" varchar(50) DEFAULT 'ESCROW',
	"data_pagamento" timestamp,
	"data_criacao" timestamp DEFAULT now(),
	CONSTRAINT "pagamentos_propostaId_propostas_id_fk" FOREIGN KEY ("propostaId") REFERENCES "propostas"("id") ON DELETE no action ON UPDATE no action
);